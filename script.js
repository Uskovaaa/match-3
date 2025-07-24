document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const scoreElement = document.getElementById('score');
    let score = 0;
    let selected = null;
    const ROWS = 6;
    const COLS = 6;
    const timer = document.getElementById('timer');

    // Элементы игры
    const elements = [
        { name: 'Аукцион', image: 'icons/icons8-аукцион-100.png' },
        { name: 'Закон', image: 'icons/icons8-закон-100.png' },
        { name: 'Договор', image: 'icons/icons8-договор-100.png' },
        { name: 'Сертификат', image: 'icons/icons8-сертификат-100.png' },
        { name: 'Инспекция', image: 'icons/icons8-инспекция-100.png' },
        { name: 'НМЦД', image: 'icons/icons8-НМЦД-100.png' }
    ];

    // Предзагрузка картинок
    function preloadImages() {
        elements.forEach(element => {
            const img = new Image();
            img.src = element.image;
            img.onload = () => {
                element.loaded = true;
            };
        });
    }

    //Закрытие модального окна
    const gameOver = document.querySelector('.game_over');
    const closeModal = document.querySelector('.close_modal');
    closeModal.addEventListener('click', ()=> {
        gameOver.classList.add('hide');
    })
    
    let intervalId = setInterval(()=> {
        if(timer.textContent == 0) {
            clearInterval(intervalId);
            gameOver.classList.remove('hide');
        }
        else {
            timer.textContent--;
        }
    }, 1000);

    // Создание игрового поля
    function createBoard() {
        board.innerHTML = '';
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const randomElement = elements[Math.floor(Math.random() * elements.length)];
                const img = document.createElement('img');
                img.src = randomElement.image;
                img.alt = randomElement.name;
                
                if (!randomElement.loaded) {
                    img.style.opacity = '0'; // Скрываем до загрузки
                    img.onload = () => {
                        img.style.opacity = '1';
                    };
                }
                
                cell.appendChild(img);
                cell.dataset.type = randomElement.name;
                cell.addEventListener('click', () => handleClick(cell));
                board.appendChild(cell);
            }
        }
    }

    // Обработка клика
    function handleClick(cell) {
        if (!selected) {
            selected = cell;
            cell.style.backgroundColor = '#d6eaf8'; // Подсветка выбранной ячейки
        } else {
            if (areAdjacent(selected, cell)) {
                // Меняем ячейки местами (без анимации)
                swapElements(selected, cell);
                
                // Проверяем совпадения
                const hadMatches = checkMatches([selected, cell]);
                
                // Если совпадений НЕТ — возвращаем как было
                if (!hadMatches) {
                    swapElements(selected, cell); // Меняем обратно
                }
                
                // Сбрасываем выделение
                selected.style.backgroundColor = '';
                selected = null;
            } else {
                // Клик на другую ячейку — сбрасываем выбор
                selected.style.backgroundColor = '';
                selected = cell;
                cell.style.backgroundColor = '#d6eaf8';
            }
        }
    }

    // Проверка соседних клеток
    function areAdjacent(cell1, cell2) {
        const row1 = parseInt(cell1.dataset.row);
        const col1 = parseInt(cell1.dataset.col);
        const row2 = parseInt(cell2.dataset.row);
        const col2 = parseInt(cell2.dataset.col);
        return (
            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2)
        );
    }

    // Обмен элементами
    function swapElements(cell1, cell2) {
        const img1 = cell1.querySelector('img');
        const img2 = cell2.querySelector('img');
    
        // Меняем src и alt местами
        const tempSrc = img1.src;
        const tempAlt = img1.alt;
    
        img1.src = img2.src;
        img1.alt = img2.alt;
        
        img2.src = tempSrc;
        img2.alt = tempAlt;
        
        // Меняем тип в dataset
        const tempType = cell1.dataset.type;
        cell1.dataset.type = cell2.dataset.type;
        cell2.dataset.type = tempType;
    }

    // Проверка совпадений (3+ в ряд)
    function checkMatches(swappedCells) {
    const cells = document.querySelectorAll('.cell');
    let matches = new Set(); // Храним индексы клеток, которые нужно очистить

        // Проверяем только строки и столбцы вокруг перемещённых клеток
        const [cell1, cell2] = swappedCells;
        const checkAround = (row, col) => {
            // Горизонтальные совпадения (проверяем все возможные линии из 3+)
            for (let c = 0; c <= COLS - 3; c++) {
                const index = row * COLS + c;
                if (cells[index].dataset.type === cells[index + 1].dataset.type && 
                    cells[index].dataset.type === cells[index + 2].dataset.type) {
                    // Найдено минимум 3. Проверяем, есть ли продолжение (4, 5...)
                    let matchLength = 3;
                    while (c + matchLength < COLS && 
                        cells[index].dataset.type === cells[index + matchLength].dataset.type) {
                        matchLength++;
                    }
                    // Добавляем все индексы совпадения
                    for (let i = 0; i < matchLength; i++) {
                        matches.add(index + i);
                    }
                    c += matchLength - 1; // Пропускаем уже проверенные
                }
            }


            // Вертикальные совпадения (аналогично)
            for (let r = 0; r <= ROWS - 3; r++) {
                const index = r * COLS + col;
                if (cells[index].dataset.type === cells[index + COLS].dataset.type && 
                    cells[index].dataset.type === cells[index + 2 * COLS].dataset.type) {
                    let matchLength = 3;
                    while (r + matchLength < ROWS && 
                        cells[index].dataset.type === cells[index + matchLength * COLS].dataset.type) {
                        matchLength++;
                    }
                    for (let i = 0; i < matchLength; i++) {
                        matches.add(index + i * COLS);
                    }
                    r += matchLength - 1;
                }
            }
        };

        // Проверяем вокруг обеих перемещённых клеток
        checkAround(parseInt(cell1.dataset.row), parseInt(cell1.dataset.col));
        checkAround(parseInt(cell2.dataset.row), parseInt(cell2.dataset.col));

        // Удаляем совпадения
        if (matches.size > 0) {
            const matchCount = matches.size;
            score += matchCount * 10; // Умножаем на 10
            scoreElement.textContent = score;

            matches.forEach(index => {
                const cell = cells[index];
                const img = cell.querySelector('img');

                // Анимация исчезновения
                cell.style.opacity = '0';
                cell.style.transform = 'scale(0.5)';

                setTimeout(() => {
                    const randomElement = elements[Math.floor(Math.random() * elements.length)];
                    img.src = randomElement.image;
                    img.alt = randomElement.name;
                    cell.dataset.type = randomElement.name;

                    // Анимация появления
                    cell.style.opacity = '1';
                    cell.style.transform = 'scale(1)';
                }, 300);
            });
            
            return true; // Были совпадения
        }
        return false; // Совпадений нет
    }

    preloadImages();
    createBoard();
});