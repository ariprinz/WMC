class BlinkingBackground {
            constructor() {
                this.container = document.getElementById('backgroundContainer');
                this.tiles = [];
                this.blinkInterval = null;
                this.effects = ['blink', 'flash', 'fade', 'glow'];
                
                this.init();
                this.startBlinking();
            }

            init() {
                this.createTiles();
                this.handleResize();
                
                // Event Listener für Fenster-Größenänderung
                window.addEventListener('resize', () => {
                    clearTimeout(this.resizeTimeout);
                    this.resizeTimeout = setTimeout(() => {
                        this.handleResize();
                    }, 250);
                });
            }

            createTiles() {
                // Berechne Anzahl der benötigten Tiles basierend auf Viewport
                const tileSize = this.getTileSize();
                const cols = Math.ceil(window.innerWidth / tileSize) + 1;
                const rows = Math.ceil(window.innerHeight / tileSize) + 1;
                const totalTiles = cols * rows;

                // Lösche vorhandene Tiles
                this.container.innerHTML = '';
                this.tiles = [];

                // Erstelle neue Tiles
                for (let i = 0; i < totalTiles; i++) {
                    const tile = document.createElement('div');
                    tile.className = 'bg-tile';
                    tile.dataset.index = i;
                    this.container.appendChild(tile);
                    this.tiles.push(tile);
                }
            }

            getTileSize() {
                if (window.innerWidth <= 480) return 40;
                if (window.innerWidth <= 768) return 60;
                return 80;
            }

            handleResize() {
                this.createTiles();
            }

            startBlinking() {
                // Stoppe vorherige Intervalle
                if (this.blinkInterval) {
                    clearInterval(this.blinkInterval);
                }

                // Starte neues Blink-Interval
                this.blinkInterval = setInterval(() => {
                    this.performRandomBlink();
                }, this.getRandomInterval(30, 150));
            }

            performRandomBlink() {
                // Wähle zufällige Anzahl von Tiles (3-8 für mehr Aktivität)
                const numTiles = Math.floor(Math.random() * 6) + 3;
                const selectedTiles = this.getRandomTiles(numTiles);
                
                selectedTiles.forEach(tile => {
                    // Wähle zufälligen Effekt
                    const effect = this.effects[Math.floor(Math.random() * this.effects.length)];
                    const duration = this.getRandomInterval(20, 120);
                    
                    // Entferne alle vorherigen Effekte
                    this.effects.forEach(eff => tile.classList.remove(eff));
                    
                    // Füge neuen Effekt hinzu
                    tile.classList.add(effect);
                    
                    // Entferne Effekt nach bestimmter Zeit
                    setTimeout(() => {
                        tile.classList.remove(effect);
                    }, duration);
                });

                // Setze nächstes Blink-Interval
                clearInterval(this.blinkInterval);
                this.blinkInterval = setTimeout(() => {
                    this.startBlinking();
                }, this.getRandomInterval(10, 80));
            }

            getRandomTiles(count) {
                const availableTiles = [...this.tiles];
                const selected = [];
                
                for (let i = 0; i < Math.min(count, availableTiles.length); i++) {
                    const randomIndex = Math.floor(Math.random() * availableTiles.length);
                    selected.push(availableTiles.splice(randomIndex, 1)[0]);
                }
                
                return selected;
            }

            getRandomInterval(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            // Öffentliche Methoden für Kontrolle
            stop() {
                if (this.blinkInterval) {
                    clearInterval(this.blinkInterval);
                    this.blinkInterval = null;
                }
            }

            start() {
                if (!this.blinkInterval) {
                    this.startBlinking();
                }
            }

            changeSpeed(minInterval = 20, maxInterval = 100) {
                this.minInterval = minInterval;
                this.maxInterval = maxInterval;
                if (this.blinkInterval) {
                    this.stop();
                    this.start();
                }
            }
        }

        // Initialisiere das blinkende Hintergrund-System
        let blinkingBg;
        
        document.addEventListener('DOMContentLoaded', () => {
            blinkingBg = new BlinkingBackground();
        });

        // Optionale Keyboard-Kontrollen
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ': // Leertaste - Pause/Resume
                    e.preventDefault();
                    if (blinkingBg.blinkInterval) {
                        blinkingBg.stop();
                    } else {
                        blinkingBg.start();
                    }
                    break;
                case 'ArrowUp': // Schneller
                    blinkingBg.changeSpeed(10, 50);
                    break;
                case 'ArrowDown': // Langsamer
                    blinkingBg.changeSpeed(50, 200);
                    break;
            }
        });

        // Performance-Optimierung: Pausiere Animationen wenn Tab nicht sichtbar
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                blinkingBg?.stop();
            } else {
                blinkingBg?.start();
            }
        });