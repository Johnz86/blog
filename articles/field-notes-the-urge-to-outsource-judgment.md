# Field Notes: Tiny Court and the urge to outsource judgment

Tiny Court of Everyday Crimes is funny for a reason that is not mainly comedic. It turns a common impulse into a toy, the wish to hand a petty grievance to an outside authority and hear a clean ruling. "My roommate ate my yogurt" is not a legal problem. It is a social irritation with a familiar shape. Someone crossed a line, nobody wants a full argument, and both sides would like a result that feels final enough to move on.

That impulse has a clear psychological basis. Cognitive offloading is the practice of using external tools or actions to reduce mental effort. Risko and Gilbert describe it in broad terms, from note taking to digital reminders, but the same logic appears in social life. People also offload small acts of judgment. We ask friends to break ties. We flip coins. We search for a neutral third party when the matter is too trivial for escalation, yet too annoying to ignore.

This is where Tiny Court becomes more than a joke app. It asks what kind of judgment people are actually willing to hand to a machine, and under what conditions that transfer still feels acceptable.

## The attraction of the petty judge

Part of the answer is simple fatigue. Everyday life is full of low-grade conflicts that do not justify the cost of a serious conversation. Who left the mug in the sink. Who took the charger. Who said "five minutes" and meant half an hour. Offloading those cases to a theatrical system can be emotionally efficient. The point is not truth in any strict sense. The point is distance, structure, and closure.

There is also a second motive, the fantasy of the unbiased observer. Human judgment is not a pure benchmark. Danziger, Levav, and Avnaim-Pesso found that parole decisions changed sharply around food breaks, which is a blunt reminder that even trained judges are affected by timing, fatigue, and default behavior. Once you see that, the appeal of an artificial judge is obvious. A machine does not get hungry, embarrassed, impatient with your tone, or personally invested in your kitchen politics.

But that attraction has limits. Research on human responses to algorithms points in two directions at once. Dietvorst, Simmons, and Massey showed that people often reject algorithms after seeing them make mistakes, even when human judgment is no better. Logg, Minson, and Moore found almost the opposite pattern in other settings, people often prefer algorithmic advice for tasks that look objective or repetitive. Put those findings together and the boundary becomes clearer. We are more willing to hand routine or low-stakes sorting to systems. We become wary when judgment looks moral, contextual, or identity-laden.

Tiny Court works because it stays on the safe side of that line. The project is built for petty nonsense, not for harm, trauma, legal disputes, or serious accusation. The [design spec](design-spec.md) says that plainly, and the shipped system enforces it with a layered safety gate on input plus an output scrub on generated text. This matters philosophically as much as technically. The app is not claiming a general right to judge. It is staging a very narrow social service, comic arbitration for things that should never be allowed to harden into institutional truth.

## What the implementation gets right about judgment

The most important design choice in the code is that the model does not own the verdict. The court's truth lives in Python. The model writes the performance, proposes meter changes, and supplies the color of the trial. The application clamps those changes and computes the final verdict deterministically.

The verdict logic is explicit:

`GuiltScore = 0.55 * Suspicion + 0.25 * EvidenceWeight + 0.20 * PettySeverity`

That score maps to three bands:

1. Not Guilty, below 35
2. Guilty of a Lesser Pettiness, 35 to 65
3. Guilty, above 65

Confidence is separate from the band label itself. After the band is assigned, confidence depends on how deep the score sits inside that band, then scales by Evidence Weight and Courtroom Dignity. That split is not just good engineering. It is a compact theory of judgment.

Suspicion is the court's appetite for vibes. Evidence Weight is what the record can actually prove. Petty Severity is the dramatic baseline of the case. Mercy does not rewrite guilt, it only softens the sentence. Dignity does not change guilt either, it changes how seriously the ruling should be taken. Patience exists to stop the whole proceeding from turning into a never-ending kitchen argument. In the Full Trial path, Suspicion is opened up into Means, Motive, and Opportunity, then recomposed from those parts.

Those distinctions matter. Real systems often blur appearance and proof, guilt and penalty, certainty and rhetoric. Tiny Court separates them on purpose. A sustained objection lowers suspicion and damages the proof on record. New evidence raises proof more than mood. A leniency plea can soften the sentence without rewriting what the court thinks happened. A witness affects motive and opportunity in ways a quick complaint does not. The structure keeps the theatrical layer legible.

There is a cautionary lesson inside the joke. A court can produce a "Guilty" verdict with low confidence if suspicion is high and proof is weak. In this app that result is funny. In a real institution it would be intolerable. The same mechanic that makes Tiny Court amusing also teaches the user how easily formal language can hide weak grounds. When a system speaks in the voice of authority, people hear more certainty than the evidence deserves. Tiny Court makes that slippage visible by scoring it directly.

## Why this is a strong use case for AI, and a weak case for AI judges

The right way to describe Tiny Court is that AI is doing reframing, not judging in any serious sense. It takes annoyance, gives it comic courtroom texture, and lets the user work through it with structured moves such as evidence, witness, objection, twist, and appeal. That is a valid use of the technology because the point is not expert correctness. The point is distance, ritual, and a lighter way to inspect the shape of a disagreement.

From a product standpoint, that narrow job is why the use case is disciplined. The interaction model is a state machine, not a vague chat. The pre-verdict trial is one growing transcript, and only the ruling switches to a paper artifact, which makes the experience feel like a proceeding rather than a chat session. The verdict engine is testable. The default path is short, about a minute, which fits both ordinary users and hackathon judges. The final output is a shareable court record rather than a pile of transcript. It also uses AI where small models can be strong, generating charges, witness testimony, arguments, and comic turns inside a constrained format. The architecture does not depend on the model being wise. It depends on the model being vivid inside boundaries.

The same logic also explains why this should remain a toy, or at most a support tool, once real human stakes appear. In human interaction, judgment is not only classification. It is accountability, relationship history, tone, repair, and responsibility for consequences. Judicial scoring tools in the real world have shown how fast a system can inherit the authority of law without earning the epistemic standards that law requires. ProPublica's reporting on COMPAS remains a useful warning sign here, not because Tiny Court resembles a sentencing engine in purpose, but because it shows what happens when risk scores, opaque rules, and institutional power meet one another.

That is the boundary I would defend. Offloading unimportant judgment can be perfectly appropriate. Choosing a movie, ranking snack theft, deciding whether the missing sock counts as sabotage, these are good places for an external referee. A machine can help because the real function is not moral sovereignty. It is comic distance and a little emotional cooling.

When the issue is serious, especially when it concerns punishment, dignity, safety, work, family, or the truth of a relationship, the presence of an "unbiased" machine is not a substitute for human judgment. At most, technology should support the humans involved by organizing facts, surfacing inconsistencies, or lowering clerical burden. The decision itself should remain answerable to a person.

Tiny Court succeeds because it does not hide that boundary. It makes authority theatrical, keeps stakes low, exposes its own scoring logic, and lets the user laugh at the very idea of wanting a machine to settle human annoyance. That is why the project works as a hackathon build, but also why it says something larger than "AI can be funny." It says that people do want to offload judgment sometimes, just not the kind where being wrong costs someone something real.

## References

1. Risko, E. F., and Gilbert, S. J. (2016). "Cognitive Offloading." Trends in Cognitive Sciences. https://doi.org/10.1016/j.tics.2016.07.002
2. Danziger, S., Levav, J., and Avnaim-Pesso, L. (2011). "Extraneous factors in judicial decisions." Proceedings of the National Academy of Sciences. https://www.pnas.org/content/108/17/6889
3. Dietvorst, B. J., Simmons, J. P., and Massey, C. (2015). "Algorithm aversion: People erroneously avoid algorithms after seeing them err." Journal of Experimental Psychology: General.
4. Logg, J. M., Minson, J. A., and Moore, D. A. (2019). "Algorithm appreciation: People prefer algorithmic to human judgment." Organizational Behavior and Human Decision Processes.
5. Angwin, J., Larson, J., Mattu, S., and Kirchner, L. (2016). "Machine Bias." ProPublica. https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing
6. "Algorithmic Risk Assessment in the Hands of Judges." Harvard Law Review, 2019. https://harvardlawreview.org/print/vol-132/algorithmic-risk-assessment-in-the-hands-of-judges/
