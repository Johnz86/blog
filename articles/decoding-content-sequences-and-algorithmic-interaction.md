### Decoding Content Sequences and Algorithmic Interaction

The core of this research involves a tool called Video Content Analysis, or VCA, which uses Vision Language Models to process video signals. Instead of reading metadata like hashtags, which are often misleading or absent, the system analyzes the actual audio and visual components. It uses a pre-trained model called Video-LLaMA to create high dimensional mathematical representations known as embeddings.

The technical pipeline involves several stages of data reduction. First, it extracts separate embeddings for audio and visual branches. These are stacked into a large vector and normalized. To make this data manageable for large scale analysis, the researchers used Principal Component Analysis to compress the vector into 100 dimensions. This represents a 99.9 percent reduction from the original data size. These compressed vectors are then grouped using KMeans clustering into 100 distinct categories, such as podcast clips or makeup tutorials.

Validation steps confirmed these clusters are accurate. In proctored interviews, participants correctly identified same cluster videos as similar 84.9 percent of the time. This demonstrates that the machine learned categories align with human perception.

The study applied this tool to a massive dataset of 2.65 million videos donated by 100 participants. Analysis of this history revealed that users exist in daily micro bubbles. On any single day, participants spent half their time watching just five topics. However, these topics changed rapidly, with 80 percent of a user's top clusters being different from one day to the next.

A significant finding challenges the idea that liking a video immediately changes the feed. Data showed that videos recommended right after a like were actually less similar to the liked content than the videos seen immediately before the interaction. This suggests that interactions are often a reaction to a sequence of similar content rather than a trigger for it.

Perceived quality also relates to novelty. Using Jensen-Shannon divergence to measure how much a session differed from a user's six month history, researchers found that people gave higher ratings to sessions that introduced new topics. Additionally, the order of videos matters. Randomly removing 30 percent of videos from a sequence significantly lowered user engagement, even when the users did not know the sequence had been modified.

Finally, the content vectors proved useful for prediction. A Random Forest model using these vectors predicted whether a user would watch more than 10 percent of a video with 70 percent accuracy. This suggests that the internal characteristics of a video are the primary driver of engagement on the platform.