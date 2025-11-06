// Snippet 1 - Context: #### Implementation Example (Python, via DP) To arrive at a solution for "kitten" vs "sitting": For Damerau extension, add transposition check:

# ... in loop:
if i > 1 and j > 1 and s1[i-1] == s2[j-2] and s1[i-2] == s2[j-1]:
    D[i][j] = min(D[i][j], D[i-2][j-2] + 1)  # transposition