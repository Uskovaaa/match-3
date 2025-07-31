document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const scoreElement = document.getElementById('score');
    let score = 0;
    let limitScore = 1000;
    let counter = 0;
    let selected = null;
    const ROWS = 6;
    const COLS = 6;
    let timer = 300;
    let intervalId;
    const modalGame = document.querySelector('.modal_game');
    const timerElement = document.getElementById('timer');
    let textModalGame = document.querySelector('.text_modal_game');
    const newGame = document.querySelector('.new_game');
    const pause = document.querySelector('.pause');
    
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

    //Начало игры
    function startGame() {
        modalGame.classList.remove('hide');
        textModalGame.innerHTML = `Наберите <span style="font-weight: 700">${limitScore}</span> очков за <span style="font-weight: 700">${timer}</span> секунд!`;
    }

    //Запуск новой игры
    newGame.addEventListener('click', () => {
        modalGame.classList.add('hide');
        score = 0;
        scoreElement.textContent = score;
        startTimer();
        createBoard();
    });

    //Проверка таймера
    function checkTimer() {
        modalGame.classList.remove('hide');
        textModalGame.innerHTML = `Время истекло! У вас <span style="font-weight: 700">${score}</span> очков!`;
        newGame.textContent = 'Начать заново'; 
    }

    //Проверка очков
    function checkScore() {
        if (score >= limitScore) {
            textModalGame.innerHTML = `Вы победили! У вас <span style="font-weight: 700">${score}</span> очков!`;
            newGame.textContent = 'Начать заново';
            setTimeout(()=> modalGame.classList.remove('hide'), 650);
            clearInterval(intervalId);
        }
    }

    //Закрытие модального окна
    // const closeModal = document.querySelector('.close_modal');
    // closeModal.addEventListener('click', ()=> {
    //     modalGame.classList.add('hide');
    // });
    
    //Таймер
    function startTimer() {
         intervalId = setInterval(()=> {
            if(timer == 0) {
                checkTimer();
                clearInterval(intervalId);             
            }
            else {
                timer--;
                timerElement.textContent = timer;
            }
        }, 1000);
    }

    //Пауза
    let isPaused = false; // Добавляем флаг паузы
    pause.addEventListener('click', () => {
        if (isPaused) {
            // Если игра на паузе - возобновляем
            modalGame.classList.add('hide');
            newGame.classList.remove('hide');
            pause.innerHTML = `<img src="/icons/icons8-pause-30.png" alt="||" id="pause">`
            startTimer(); // Запускаем таймер снова
        } else {
            // Если игра идет - ставим на паузу
            modalGame.classList.remove('hide');
            newGame.classList.add('hide');
            textModalGame.textContent = 'Пауза';
            clearInterval(intervalId);
            pause.innerHTML = `<img src="/icons/icons8-воспроизведение-30.png" alt="||" id="pause">` // Останавливаем таймер
        }
        isPaused = !isPaused; // Меняем состояние паузы
    });
            
    // Создание игрового поля
    function createBoard() {
        if (counter == 0) startGame();
        console.log(counter);
        
        timerElement.textContent = timer;

        board.innerHTML = '';
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Выбираем элемент, который не создаст совпадений
                const randomElement = getValidElement(row, col);
                const img = document.createElement('img');
                img.src = randomElement.image;
                img.alt = randomElement.name;
                
                cell.appendChild(img);
                cell.dataset.type = randomElement.name;
                cell.addEventListener('click', () => handleClick(cell));
                board.appendChild(cell);
            } 
        }
        setTimeout(checkBoard, 100);
        counter++; 
    }

    // Выбирает элемент, который не создаст линию из 3+
    function getValidElement(row, col) {
        const prev1 = getCellType(row, col - 1); // Слева
        const prev2 = getCellType(row, col - 2); // Два слева
        const prev3 = getCellType(row - 1, col); // Сверху
        const prev4 = getCellType(row - 2, col); // Два сверху
            
        // Фильтруем элементы, исключая те, что создадут совпадение
        const validElements = elements.filter(element => {
            if (prev1 && prev2 && prev1 === prev2 && prev1 === element.name) return false;
            if (prev3 && prev4 && prev3 === prev4 && prev3 === element.name) return false;
            return true;
        });
            
        // Если все варианты ведут к совпадению, берём случайный (редкий случай)
        return validElements.length > 0 
            ? validElements[Math.floor(Math.random() * validElements.length)]
            : elements[Math.floor(Math.random() * elements.length)];
    }

        // Возвращает тип ячейки по координатам (для проверки при генерации)
        function getCellType(row, col) {
            if (row < 0 || col < 0) return null;
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            return cell ? cell.dataset.type : null;                       
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
                setTimeout(checkBoard, 300); // Проверка после анимации
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
            checkScore();
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

    function checkBoard() {
    const cells = document.querySelectorAll('.cell');
    let matches = new Set();

    // Проверка всех строк и столбцов
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 2; col++) {
            const index = row * COLS + col;
            // Горизонтальные совпадения
            if (cells[index].dataset.type === cells[index + 1].dataset.type && 
                cells[index].dataset.type === cells[index + 2].dataset.type) {
                let matchLength = 3;
                while (col + matchLength < COLS && 
                       cells[index].dataset.type === cells[index + matchLength].dataset.type) {
                    matches.add(index + matchLength);
                    matchLength++;
                }
                matches.add(index).add(index + 1).add(index + 2);
                col += matchLength - 1;
            }
        }
    }

    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS - 2; row++) {
            const index = row * COLS + col;
            // Вертикальные совпадения
            if (cells[index].dataset.type === cells[index + COLS].dataset.type && 
                cells[index].dataset.type === cells[index + 2 * COLS].dataset.type) {
                let matchLength = 3;
                while (row + matchLength < ROWS && 
                       cells[index].dataset.type === cells[index + matchLength * COLS].dataset.type) {
                    matches.add(index + matchLength * COLS);
                    matchLength++;
                }
                matches.add(index).add(index + COLS).add(index + 2 * COLS);
                row += matchLength - 1;
            }
        }
    }

    // Если есть совпадения — удаляем их и проверяем поле снова
    if (matches.size > 0) {
        replaceMatches(matches);
        checkBoard(); // Рекурсивная проверка (на случай новых совпадений)
    }
}

// Заменяет совпавшие ячейки новыми
function replaceMatches(matches) {
    const cells = document.querySelectorAll('.cell');
    matches.forEach(index => {
        const cell = cells[index];
        const img = cell.querySelector('img');
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        img.src = randomElement.image;
        img.alt = randomElement.name;
        cell.dataset.type = randomElement.name;
    });
    score += matches.size * 10;
    scoreElement.textContent = score;
}

    preloadImages();
    createBoard();
});