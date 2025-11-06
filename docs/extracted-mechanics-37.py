def levenshtein(s1, s2):
    m, n = len(s1), len(s2)
    D = [[0] * (n+1) for _ in range(m+1)]
    for i in range(m+1): D[i][0] = i
    for j in range(n+1): D[0][j] = j
    for i in range(1, m+1):
        for j in range(1, n+1):
            cost = 0 if s1[i-1] == s2[j-1] else 1
            D[i][j] = min(D[i-1][j] + 1,      # delete
                          D[i][j-1] + 1,      # insert
                          D[i-1][j-1] + cost) # substitute
    return D[m][n]

print(levenshtein("kitten", "sitting"))  # Output: 3