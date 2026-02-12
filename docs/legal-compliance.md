# Legal Compliance Research: CallIt (Play-Money Prediction Platform)

## Summary

CallIt is a play-money prediction platform where users receive free virtual points ("calls") and predict outcomes in content creator events. No real money is involved at any point -- no purchases, no cash-out, no monetary prizes. Based on our research, **CallIt does not constitute gambling under Danish law or EU regulations**, but there are specific requirements we must meet around data protection (GDPR) and consumer transparency.

---

## 1. Danish Gambling Law (Spilleloven)

### What the law says

The Danish Gambling Act (Spilleloven), administered by the Danish Gambling Authority (Spillemyndigheden), defines gambling in **Section 5** through three categories:

- **Lottery**: Chance of winning a prize, probability based solely on chance
- **Combination games**: Chance of winning a prize, probability based on skill + chance
- **Betting**: Chance of winning a prize, bets placed on future event outcomes

All three categories share a common requirement: **a prize ("gevinst") of monetary value** and **a stake ("indsats")** -- both terms implying real financial value.

### Why CallIt is not gambling under Spilleloven

CallIt fails to meet the legal definition of gambling because:

1. **No stake (indsats)**: Users do not pay anything to participate. Points are free and have zero monetary value.
2. **No prize (gevinst)**: There is no prize with monetary value. Leaderboard positions and bragging rights are not "prizes" under the Act.
3. **No real money in the system**: At no point does real currency enter or leave the platform.

The Danish Gambling Act requires a licence only for activities involving real-money stakes and prizes. Play-money platforms where virtual currency has no cash value and cannot be exchanged, purchased, or redeemed fall outside the scope of Spilleloven.

### Caveats

- **Do not introduce any path from points to real value.** The moment points can be purchased, traded, or redeemed for anything of monetary value, the platform could be reclassified as gambling.
- **Do not offer prizes with monetary value.** Even gift cards or merchandise as prizes could trigger gambling classification.
- **Marketing matters.** Do not use language that frames CallIt as "betting" or "gambling" in marketing materials. Use "predictions," "calls," "entertainment."
- **If in doubt, consult Spillemyndigheden.** They offer guidance to operators uncertain about classification. For a PoC this is unnecessary, but would be advisable before any commercial launch.

### Source

Danish Gambling Act (Spilleloven): https://www.spillemyndigheden.dk/uploads/2019-01/Act%20on%20Gambling.pdf

---

## 2. EU-Level Regulations

### Gambling regulation

The EU does not have a unified gambling regulation. Each member state regulates gambling independently. The European Commission has issued recommendations (e.g., 2014/478/EU on online gambling) but these are non-binding and focus on real-money gambling.

Play-money platforms with no real-money component are **not addressed by EU gambling frameworks**.

### Consumer protection

The EU Consumer Protection Cooperation (CPC) Network published Key Principles on in-game virtual currencies (March 2025). These primarily target:

- Free-to-play games with **in-app purchases** using virtual currencies
- Transparency around real-money costs disguised by virtual currency layers
- Protection of vulnerable consumers (children)

**These rules are largely irrelevant to CallIt** because:
- There are no in-app purchases
- Virtual points cannot be bought with real money
- There is no currency obfuscation

However, the general principles of **transparency and protection of minors** still apply as good practice.

### GDPR

The General Data Protection Regulation applies fully. See Privacy Policy for our compliance approach.

---

## 3. Age Requirements

### Danish law

- **Gambling minimum age**: 18 years (irrelevant -- CallIt is not gambling)
- **GDPR digital consent age in Denmark**: **13 years** (Act No. 502 of 23 May 2018, Section 6(2))
- **Social media age limit**: Denmark introduced a 15-year minimum for self-registration on designated social media platforms (November 2025 political agreement), but this targets platforms like TikTok/Instagram and does not apply to entertainment/prediction platforms.

### Our approach

- **Minimum age: 13+** -- aligns with Denmark's GDPR digital consent threshold
- Users under 13 would need parental consent for data processing, which is impractical for a PoC. Simpler to set 13 as the minimum.
- Implement a simple age gate (checkbox or date-of-birth confirmation) during sign-up

---

## 4. Key Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Reclassification as gambling | Very low (no real money) | Never introduce real-money paths. Keep ToS clear. |
| GDPR complaint | Low (minimal data) | Collect only what's needed. Provide deletion mechanism. |
| Minor under 13 signs up | Medium | Age gate at registration. ToS prohibits under-13 use. |
| Misleading advertising claim | Low | Avoid gambling terminology. Frame as entertainment. |

---

## 5. Recommendations for PoC

1. **Terms of Service**: Clearly state points have no monetary value, platform is entertainment only, minimum age 13+. (See `/docs/terms-of-service.md`)
2. **Privacy Policy**: GDPR-compliant, minimal data collection disclosure. (See `/docs/privacy-policy.md`)
3. **Age gate**: Simple confirmation at sign-up (checkbox: "I confirm I am 13 years or older")
4. **Language discipline**: Use "predictions" and "calls" -- never "bets," "gambling," or "wagering" in UI or marketing
5. **No prizes of value**: Leaderboards only. No gift cards, no merchandise, no partnerships that create monetary incentives
6. **No purchase paths**: Never add the ability to buy, sell, or trade points

---

## 6. Conclusion

For a PoC with zero real money, CallIt is clearly outside the scope of Danish gambling regulation. The main legal obligations are:

- **GDPR compliance** (minimal data, consent, deletion rights)
- **Age gate** (13+)
- **Clear terms** stating entertainment-only nature

No gambling licence is required. No notification to Spillemyndigheden is necessary for a play-money platform. If the project ever evolves toward real money or prizes of value, a full legal review would be needed.
