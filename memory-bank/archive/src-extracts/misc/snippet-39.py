// Snippet 1 - Context: The **Levenshtein distance** (or edit distance) measures the minimum number of single-character operations—insertions, deletions, or substitutions—needed to transform one string into another. It's a foundational metric in string similarity, used in spell checking, DNA alignment, and fuzzy search. For example, the distance between "kitten" and "sitting" is 3 (substitute 'k'→'s', insert 'i', substitute 'e'→'g'). #### Standard Implementation It's computed via dynamic programming with a matrix where each cell represents the cost to align prefixes. Here's a Python example:

def levenshtein_distance(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]

# Example
print(levenshtein_distance("kitten", "sitting"))  # Output: 3