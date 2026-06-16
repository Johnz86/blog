# Training Small Language Models on KInIT Infrastructure

[![NVIDIA RTX PRO 6000 Blackwell Server Edition reference image](https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/professional-desktop-gpus/rtx-pro-6000-family/rtx-pro-6000-blackwell-og.jpg)](https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000-family/)

*Reference image: NVIDIA RTX PRO 6000 Blackwell Server Edition. Source: NVIDIA.*

KInIT, the Kempelen Institute of Intelligent Technologies in Bratislava, is building a private research cloud for AI and data systems. A useful way to judge that environment is not by peak specifications alone, but by whether one researcher can provision a GPU VM, train a model end to end, recover from normal failures, store the outputs, and hand the workflow to the next person without mystery. That is what this run tested.

The infrastructure behind the run is substantial. KInIT's private cloud is built on OpenStack and Kubernetes. The user allocatable side includes four multi GPU servers and one CPU node, with 20 NVIDIA RTX PRO 6000 Blackwell Server Edition cards and 5 NVIDIA H200 NVL cards across the cluster. Shared storage comes from Ceph backed NVMe plus separate SSD and HDD appliances. On paper that is a strong local research platform. The real question was simpler: can a single RTX PRO 6000 VM support a clean, teachable LLM training workflow?

## The test machine

The training run used one VM on `kinit-m1-gpu-2` with this shape:

| Resource | Value |
|---|---|
| GPU | 1 x NVIDIA RTX PRO 6000 Blackwell Server Edition |
| VRAM | about 96 GB |
| CPU | 32 vCPU |
| RAM | 128 GiB |
| Image | Ubuntu 24.04 minimal, NVIDIA 595, CUDA 13 dev tools |
| Root disk | 200 GB Ceph NVMe boot volume |

This is a good middle ground for teaching. It is much more accessible than an 8 x H100 setup, but it is still large enough to run a full small model pipeline without toy shortcuts. The 200 GB boot volume mattered. Training code, datasets, checkpoints, package caches, and temporary artifacts grow faster than many people expect, especially once you keep more than one experiment variant.

## Why nanochat was the right workload

Karpathy's `nanochat` is small enough that students can read the code, yet large enough to surface the problems that matter in real work. It includes tokenizer training, pretraining, supervised fine tuning, evaluation, mixed precision, checkpointing, experiment logging, and long running job management. That makes it a better teaching probe than a short synthetic benchmark.

The final training family used a d24 decoder only model with 24 layers, width 1536, 12 attention heads, context length 2048, and about 1.38 billion parameters. This is big enough to stress the stack, but still reasonable for one modern GPU. It also makes backend comparisons meaningful, because the run is long enough for throughput, memory, and checkpoint behavior to show their real character.

## Provisioning is only the first step

The VM provisioning path itself was not the interesting part. OpenStack could place the instance on a valid RTX 6000 host, attach a floating IP, and boot from a Cinder volume. The more important part was what happened after first login.

The software stack settled on Ubuntu 24.04, NVIDIA 595, CUDA 13, PyTorch 2.9.1, `uv` for Python environment management, `tmux` for long jobs, Weights and Biases for experiment tracking, and `rclone` to OpenStack object storage for backups. That is a normal, maintainable stack. Nothing here depends on a one off image or a hand tuned workstation.

Even so, a few issues had to be fixed before the system was trustworthy for long training runs. The code needed correct FLOPS metadata for the RTX PRO 6000 so MFU would report real numbers instead of zero. The generation path needed a KV cache dtype fix so inference followed the chosen compute dtype. The SFT path needed a patch to skip packed batches whose targets were entirely ignored, because that case produced `loss: nan`. PyTorch also showed an NVML warning until the NVIDIA packages were held at a consistent 595 server version and the VM was rebooted. None of these are dramatic failures. They are the ordinary integration edges that separate a shiny demo from a usable research environment.

## What actually worked on Blackwell

The most useful result from this run was not a single model score. It was the backend comparison on Blackwell.

Flash Attention 2 was the best practical default. It supported the intended `SSSL` sliding window attention path in nanochat, stayed memory efficient, and delivered the fastest completed full d24 run. Base training finished in about 23.9 hours, with throughput near the end around 67.8k tokens per second. SFT finished in about 149 minutes, with throughput near 55.8k tokens per second.

Plain PyTorch SDPA fallback was slower in the full context baseline, but it still validated the infrastructure. That mattered because it proved the VM could complete an end to end run even before the best backend path was settled.

cuDNN SDPA was interesting but incomplete. It worked for full sequence training, yet it did not cleanly cover all of nanochat's evaluation and generation shapes. Flash Attention 4 could be integrated and did complete d24 runs, but it used more memory and ran slower than FA2 on this setup. Flash Attention 3 was not usable through the available community kernels for SM120. That is an important lesson for any local GPU cloud: "supports CUDA" is not the same thing as "supports this architecture, this model shape, and this code path."

## What one RTX PRO 6000 could sustain

The raw training numbers are strong for a single card. The best d24 FA2 run looked like this:

| Metric | Result |
|---|---:|
| Base train time | 23.88 h |
| Base throughput near end | about 67.8k tok/s |
| Base peak GPU memory | 52.6 GiB |
| SFT time | 148.96 m |
| SFT throughput near end | about 55.8k tok/s |
| SFT peak GPU memory | 60.2 GiB |

These memory figures matter as much as the runtimes. The card has about 96 GB of VRAM, and the d24 runs stayed comfortably within that budget. That leaves headroom for a sensible device batch size, evaluation passes, and backend experimentation without running into constant out of memory failures. During sustained training the GPU could sit near full utilization, draw roughly 575 W out of a 600 W limit, and keep the host CPU lightly loaded. The loop was clearly GPU bound, not CPU bound.

The quality differences between the completed d24 variants were small. The operational picture was more decisive. FA2 was fastest and best supported. cuDNN had some attractive metrics but patchy coverage. FA4 was valid as an experiment, not a default. That is the kind of result a research team can act on.

## The real bottleneck was storage discipline

The clearest lesson from this exercise was that small model training on a strong GPU is often easier than storage hygiene. After the FA4 run, the 200 GB root volume was 97 percent full. The nanochat cache alone took 153 GB, mostly because multiple checkpoint series were still present. A single full d24 base run with intermediate checkpoints could consume about 56 GB. Final backed up artifacts for one run were around 18.6 GiB.

That means a single user can work comfortably on a 200 GB root volume, but only if checkpoint cleanup and object storage backup are treated as part of the workflow, not as an afterthought. The right pattern is simple: run long jobs in `tmux`, write logs, write a completion marker only after a clean exit, back up final artifacts to object storage, then delete intermediate checkpoints. If KInIT wants to use this setup for teaching with several students or several backend variants at once, larger attached volumes or stricter retention rules will matter more than a few extra percent of model quality.

## Why this matters for KInIT

KInIT is not just buying GPUs. It is building an environment where research, teaching, and applied engineering can share the same operational base. This run shows that the RTX PRO 6000 side of that platform is already useful for real single GPU language model work. A researcher can provision a VM, use a current CUDA and PyTorch stack, run a 1.38B parameter training pipeline, compare backend choices, log results to a local W&B instance, and archive outputs to OpenStack object storage. That is enough for coursework, reproducible demos, method development, and many early stage experiments.

It also shows where the next improvements matter. Stable kernel support on new GPU architectures matters. Image design matters. Backup and checkpoint policy matter. Good internal runbooks matter. Those are not secondary concerns. They are what turn hardware into infrastructure.

For KInIT, the practical conclusion is clear. The RTX PRO 6000 Blackwell Server Edition is not just a good procurement line item. In this cloud, it is already a workable training platform for small language models and a solid base for teaching how modern LLM systems are actually built.

## References

1. [KInIT, About Us](https://kinit.sk/about-us/)
2. [NVIDIA RTX PRO 6000 Blackwell Series](https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000-family/)
