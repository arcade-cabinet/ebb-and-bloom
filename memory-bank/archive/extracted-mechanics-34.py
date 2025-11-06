from collections import Counter

# Sample haiku generator (5-7-5 syllable mock)
def generate_haiku(seed_phrase):
    lines = [
        f"{seed_phrase} whispers in the",
        "vein of forgotten echoes",
        "tides pull the light low"
    ]
    return ' '.join(lines)

# Generate 5 sample haikus with varying repetition
haikus = [
    generate_haiku("flipper"),
    generate_haiku("burr"),
    generate_haiku("flipper vein"),  # Repeat motif
    generate_haiku("tidal scar"),
    generate_haiku("flipper tide")   # High overlap
]

# Simple keyword overlap scorer (Jaccard similarity)
def jaccard_similarity(s1, s2):
    a = set(s1.lower().split())
    b = set(s2.lower().split())
    intersection = len(a.intersection(b))
    union = len(a.union(b))
    return intersection / union if union != 0 else 0

# Score: Avg pairwise similarity, flag >0.2 (20%)
def score_haikus(haikus, threshold=0.2):
    similarities = []
    flagged = []
    for i in range(len(haikus)):
        for j in range(i+1, len(haikus)):
            sim = jaccard_similarity(haikus[i], haikus[j])
            similarities.append(sim)
            if sim > threshold:
                flagged.append((i, j, sim))
    
    avg_sim = sum(similarities) / len(similarities) if similarities else 0
    return {
        'average_similarity': avg_sim,
        'flagged_pairs': flagged,  # (idx1, idx2, sim)
        'haikus': haikus,
        'recommendation': 'Diversify: Introduce unlikely metaphors (e.g., thorn as lover)' if avg_sim > threshold else 'Varied enough—evo aches fresh'
    }

result = score_haikus(haikus)
print(result)