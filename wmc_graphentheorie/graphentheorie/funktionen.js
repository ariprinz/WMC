

// Matrix-Parsing-Funktion
function parseMatrix(text) {
    const lines = text.trim().split('\n');
    const matrix = [];
    
    for (let line of lines) {
        const row = line.split(',').map(val => parseFloat(val.trim()));
        if (row.some(isNaN)) {
            throw new Error('Ungültige Matrixwerte gefunden');
        }
        matrix.push(row);
    }
    
    // Überprüfung auf rechteckige Matrix
    const cols = matrix[0].length;
    for (let row of matrix) {
        if (row.length !== cols) {
            throw new Error('Matrix muss rechteckig sein');
        }
    }
    
    return matrix;
}

// Matrix zu String formatieren
function matrixToString(matrix) {
    return matrix.map(row => row.join(', ')).join('\n');
}

// Zufällige 4x4 Matrix generieren
function generateRandomMatrix(elementId) {
    const matrix = [];
    for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
            row.push(Math.floor(Math.random() * 2)); // 0 oder 1 für Adjazenzmatrix
        }
        matrix.push(row);
    }
    document.getElementById(elementId).value = matrixToString(matrix);
}

// CSV-Datei laden
function loadCSV(fileInputId, textareaId) {
    const file = document.getElementById(fileInputId).files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvData = e.target.result;
        document.getElementById(textareaId).value = csvData.trim();
    };
    reader.readAsText(file);
}

// Matrizenmultiplikation
function multiplyMatrices() {
    try {
        const matrixA = parseMatrix(document.getElementById('matrixA').value);
        const matrixB = parseMatrix(document.getElementById('matrixB').value);
        
        if (matrixA[0].length !== matrixB.length) {
            throw new Error('Spaltenanzahl von Matrix A muss gleich Zeilenzahl von Matrix B sein');
        }
        
        const result = [];
        for (let i = 0; i < matrixA.length; i++) {
            result[i] = [];
            for (let j = 0; j < matrixB[0].length; j++) {
                result[i][j] = 0;
                for (let k = 0; k < matrixB.length; k++) {
                    result[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }
        
        document.getElementById('resultMatrix').textContent = matrixToString(result);
        
        // Graphenanalyse mit der resultierenden Matrix
        analyzeGraph(result);
        
    } catch (error) {
        document.getElementById('resultMatrix').innerHTML = `<div class="error">Fehler: ${error.message}</div>`;
        document.getElementById('analysisResults').innerHTML = '';
    }
}

// Graphenanalyse
function analyzeGraph(matrix) {
    try {
        const n = matrix.length;
        
        // Distanzmatrix berechnen (Floyd-Warshall)
        const dist = calculateDistances(matrix);
        
        // Exzentrizitäten berechnen
        const eccentricities = calculateEccentricities(dist);
        
        // Radius, Durchmesser, Zentrum
        const radius = Math.min(...eccentricities.filter(e => e !== Infinity));
        const diameter = Math.max(...eccentricities.filter(e => e !== Infinity));
        const center = eccentricities.map((e, i) => e === radius ? i : -1).filter(i => i !== -1);
        
        // Komponenten finden
        const components = findConnectedComponents(matrix);
        
        // Artikulationspunkte und Brücken
        const articulations = findArticulationPoints(matrix);
        const bridges = findBridges(matrix);
        
        // Eulersche Pfade/Zyklen
        const eulerInfo = checkEulerianPaths(matrix);
        
        displayAnalysisResults({
            distances: dist,
            eccentricities: eccentricities,
            radius: radius,
            diameter: diameter,
            center: center,
            components: components,
            articulations: articulations,
            bridges: bridges,
            euler: eulerInfo
        });
        
    } catch (error) {
        document.getElementById('analysisResults').innerHTML = `<div class="error">Analysefehler: ${error.message}</div>`;
    }
}

// Floyd-Warshall Algorithmus für kürzeste Distanzen
function calculateDistances(matrix) {
    const n = matrix.length;
    const dist = Array(n).fill().map(() => Array(n).fill(Infinity));
    
    // Initialisierung
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) {
                dist[i][j] = 0;
            } else if (matrix[i][j] > 0) {
                dist[i][j] = 1;
            }
        }
    }
    
    // Floyd-Warshall
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
    
    return dist;
}

// Exzentrizitäten berechnen
function calculateEccentricities(dist) {
    const n = dist.length;
    const eccentricities = [];
    
    for (let i = 0; i < n; i++) {
        let maxDist = 0;
        for (let j = 0; j < n; j++) {
            if (dist[i][j] !== Infinity && dist[i][j] > maxDist) {
                maxDist = dist[i][j];
            }
        }
        eccentricities.push(maxDist === 0 ? Infinity : maxDist);
    }
    
    return eccentricities;
}

// Zusammenhängende Komponenten finden
function findConnectedComponents(matrix) {
    const n = matrix.length;
    const visited = Array(n).fill(false);
    const components = [];
    
    function dfs(node, component) {
        visited[node] = true;
        component.push(node);
        
        for (let i = 0; i < n; i++) {
            if (!visited[i] && (matrix[node][i] > 0 || matrix[i][node] > 0)) {
                dfs(i, component);
            }
        }
    }
    
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            const component = [];
            dfs(i, component);
            components.push(component);
        }
    }
    
    return components;
}

// Artikulationspunkte finden
function findArticulationPoints(matrix) {
    const n = matrix.length;
    const visited = Array(n).fill(false);
    const disc = Array(n).fill(0);
    const low = Array(n).fill(0);
    const parent = Array(n).fill(-1);
    const ap = Array(n).fill(false);
    let time = 0;
    
    function dfs(u) {
        let children = 0;
        visited[u] = true;
        disc[u] = low[u] = ++time;
        
        for (let v = 0; v < n; v++) {
            if (matrix[u][v] > 0 || matrix[v][u] > 0) {
                if (!visited[v]) {
                    children++;
                    parent[v] = u;
                    dfs(v);
                    
                    low[u] = Math.min(low[u], low[v]);
                    
                    if (parent[u] === -1 && children > 1) {
                        ap[u] = true;
                    }
                    
                    if (parent[u] !== -1 && low[v] >= disc[u]) {
                        ap[u] = true;
                    }
                } else if (v !== parent[u]) {
                    low[u] = Math.min(low[u], disc[v]);
                }
            }
        }
    }
    
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            dfs(i);
        }
    }
    
    return ap.map((isAP, index) => isAP ? index : -1).filter(x => x !== -1);
}

// Brücken finden
function findBridges(matrix) {
    const n = matrix.length;
    const visited = Array(n).fill(false);
    const disc = Array(n).fill(0);
    const low = Array(n).fill(0);
    const parent = Array(n).fill(-1);
    const bridges = [];
    let time = 0;
    
    function dfs(u) {
        visited[u] = true;
        disc[u] = low[u] = ++time;
        
        for (let v = 0; v < n; v++) {
            if (matrix[u][v] > 0 || matrix[v][u] > 0) {
                if (!visited[v]) {
                    parent[v] = u;
                    dfs(v);
                    
                    low[u] = Math.min(low[u], low[v]);
                    
                    if (low[v] > disc[u]) {
                        bridges.push([u, v]);
                    }
                } else if (v !== parent[u]) {
                    low[u] = Math.min(low[u], disc[v]);
                }
            }
        }
    }
    
    for (let i = 0; i < n; i++) {
        if (!visited[i]) {
            dfs(i);
        }
    }
    
    return bridges;
}

// Eulersche Pfade/Zyklen prüfen
function checkEulerianPaths(matrix) {
    const n = matrix.length;
    const degrees = Array(n).fill(0);
    
    // Knotengrade berechnen
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] > 0) {
                degrees[i]++;
            }
        }
    }
    
    const oddDegreeCount = degrees.filter(deg => deg % 2 === 1).length;
    
    if (oddDegreeCount === 0) {
        return "Eulerscher Zyklus vorhanden";
    } else if (oddDegreeCount === 2) {
        return "Eulerscher Pfad vorhanden (kein Zyklus)";
    } else {
        return "Kein Eulerscher Pfad/Zyklus vorhanden";
    }
}

// Analyseergebnisse anzeigen
function displayAnalysisResults(results) {
    const container = document.getElementById('analysisResults');
    
    container.innerHTML = `
        <div class="analysis-card">
            <h4>Distanzen aller Knoten</h4>
            <div class="analysis-content">${matrixToString(results.distances.map(row => 
                row.map(d => d === Infinity ? '∞' : d)))}</div>
        </div>
        
        <div class="analysis-card">
            <h4>Exzentrizitäten</h4>
            <div class="analysis-content">${results.eccentricities.map((e, i) => 
                `Knoten ${i}: ${e === Infinity ? '∞' : e}`).join('\n')}</div>
        </div>
        
        <div class="analysis-card">
            <h4>Radius, Durchmesser und Zentrum</h4>
            <div class="analysis-content">Radius: ${results.radius === Infinity ? '∞' : results.radius}
Durchmesser: ${results.diameter === Infinity ? '∞' : results.diameter}
Zentrum: {${results.center.join(', ')}}</div>
        </div>
        
        <div class="analysis-card">
            <h4>Eulersche Linien/Zyklen</h4>
            <div class="analysis-content">${results.euler}</div>
        </div>
        
        <div class="analysis-card">
            <h4>Komponenten</h4>
            <div class="analysis-content">${results.components.map((comp, i) => 
                `Komponente ${i + 1}: {${comp.join(', ')}}`).join('\n')}</div>
        </div>
        
        <div class="analysis-card">
            <h4>Artikulationspunkte</h4>
            <div class="analysis-content">${results.articulations.length > 0 ? 
                results.articulations.join(', ') : 'Keine Artikulationspunkte'}</div>
        </div>
        
        <div class="analysis-card">
            <h4>Brücken</h4>
            <div class="analysis-content">${results.bridges.length > 0 ? 
                results.bridges.map(bridge => `(${bridge[0]}, ${bridge[1]})`).join('\n') : 'Keine Brücken'}</div>
        </div>
    `;
}