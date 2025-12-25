
// Mock logic from tagAnalysisService.ts to isolate the algorithm

const STOP_WORDS = new Set(["et", "and", "&", "le", "la", "les", "the", "a", "an", "de", "of", "in", "en"]);

const tokenize = (str: string): Set<string> => {
    return new Set(
        str.toLowerCase()
        .replace(/[^\w\s]/g, "") 
        .split(/\s+/)
        .filter(w => w.length > 0 && !STOP_WORDS.has(w))
    );
};

const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) { if(!matrix[0]) matrix[0] = []; matrix[0][j] = j; }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          Math.min(matrix[i]![j - 1]! + 1, matrix[i - 1]![j]! + 1)
        );
      }
    }
  }
  return matrix[b.length]![a.length]!;
};

const areTokensSimilar = (a: Set<string>, b: Set<string>): boolean => {
    if (a.size === 0 || b.size === 0) return false;
    const intersection = new Set([...a].filter(x => b.has(x)));
    const unionSize = new Set([...a, ...b]).size;
    const jaccard = intersection.size / unionSize;
    return jaccard >= 0.8; 
};

async function run() {
    const mockTags = [
        { id: "1", name: "rouge", type: "manual" },
        { id: "2", name: "rouges", type: "manual" },
        { id: "3", name: "noir et blanc", type: "manual" },
        { id: "4", name: "noir blanc", type: "manual" },
        { id: "5", name: "paysage", type: "manual" },
    ];

    const processedIds = new Set<string>();
    const groups: any[] = [];

    const simpleTags = mockTags.map(t => ({
        ...t,
        simpleName: t.name.toLowerCase().trim().replace(/s$/, ""), 
        tokens: tokenize(t.name)
    }));

    console.log("Debug: Simple Names mapping:");
    simpleTags.forEach(t => console.log(`"${t.name}" -> simpleName: "${t.simpleName}"`));

    for (let i = 0; i < simpleTags.length; i++) {
        const root = simpleTags[i];
        if (!root) continue;
        if (processedIds.has(root.id)) continue;

        const group = {
            target: root,
            candidates: [] as any[]
        };

        for (let j = i + 1; j < simpleTags.length; j++) {
            const candidate = simpleTags[j];
            if (!candidate) continue;
            if (processedIds.has(candidate.id)) continue;

            const dist = levenshteinDistance(root.simpleName, candidate.simpleName);
            const isLevenshteinMatch = dist <= 1 || (dist <= 2 && root.simpleName.length > 5);
            const isTokenMatch = areTokensSimilar(root.tokens, candidate.tokens);
            const isExactSimpleMatch = root.simpleName === candidate.simpleName;

            console.log(`Comparing "${root.name}" vs "${candidate.name}":`);
            console.log(`- Levenshtein Dist on '${root.simpleName}'/'${candidate.simpleName}': ${dist}`);
            console.log(`- Token Jaccard: ${isTokenMatch}`);
            console.log(`- Exact Simple Match: ${isExactSimpleMatch}`);

            if (isLevenshteinMatch || isTokenMatch || isExactSimpleMatch) {
                console.log("  >>> MATCH FOUND");
                group.candidates.push(candidate);
                processedIds.add(candidate.id);
            }
        }

        if (group.candidates.length > 0) {
            groups.push(group);
            processedIds.add(root.id);
        }
    }

    console.log("\n--- Results ---");
    console.log(JSON.stringify(groups, null, 2));
}

run();
