document.addEventListener('DOMContentLoaded', () => {
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-btn');
    const modalDate = document.getElementById('modalDate');
    const studyHoursInput = document.getElementById('studyHours');
    const weeklyGoalInput = document.getElementById('weeklyGoal');
    const saveBtn = document.getElementById('saveBtn');

    let currentDate = new Date();
    let currentDayElement = null;

    // Cargar datos guardados del localStorage
    let studyData = JSON.parse(localStorage.getItem('studyData')) || {};
    let weeklyGoals = JSON.parse(localStorage.getItem('weeklyGoals')) || {};

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Obtener el primer día del mes y el último día del mes
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Domingo, 1 = Lunes
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

        // Limpiar el calendario
        calendarDays.innerHTML = '';
        currentMonthYear.textContent = new Date(year, month).toLocaleString('es-ES', { month: 'long', year: 'numeric' });

        // Agregar días vacíos al inicio para alinear con el día de la semana
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty-day');
            calendarDays.appendChild(emptyDay);
        }

        // Agregar los días del mes
        for (let day = 1; day <= lastDayOfMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayElement.dataset.date = fullDate;

            // Marcar el día actual
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('today');
            }

            // Mostrar horas de estudio si existen
            const hours = studyData[fullDate] || 0;
            dayElement.innerHTML = `<span class="day-number">${day}</span><div class="total-hours">${hours}h</div>`;

            dayElement.addEventListener('click', () => {
                currentDayElement = dayElement;
                modalDate.textContent = fullDate;
                studyHoursInput.value = studyData[fullDate] || 0;
                // Cargar la meta semanal del lunes de la semana actual
                const weekStartDate = getStartOfWeek(new Date(fullDate));
                weeklyGoalInput.value = weeklyGoals[weekStartDate] || 10;
                modal.style.display = 'flex';
            });

            calendarDays.appendChild(dayElement);
        }

        // Marcar el estado semanal
        markWeeklyStatus();
    };

    const getStartOfWeek = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day; // Ajusta para el lunes (day 1)
        const startOfWeek = new Date(date.setDate(diff));
        return `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
    };

    const markWeeklyStatus = () => {
        const days = document.querySelectorAll('.calendar-days .day:not(.empty-day)');
        let weeklyTotal = 0;
        let weekStartDate = '';
        
        days.forEach((dayElement, index) => {
            const dayOfWeek = (index + currentDate.getDay()) % 7; // Ajuste para el día de la semana
            const date = dayElement.dataset.date;
            
            if (dayOfWeek === 0 || index === 0) {
                // Inicia una nueva semana
                weeklyTotal = 0;
                weekStartDate = getStartOfWeek(new Date(date));
            }
            
            const hours = parseInt(studyData[date] || 0);
            weeklyTotal += hours;

            if (dayOfWeek === 6 || index === days.length - 1) {
                // Fin de la semana o del mes
                const goal = weeklyGoals[weekStartDate] || 10;
                const statusDiv = document.createElement('div');
                statusDiv.classList.add('week-status');
                
                if (weeklyTotal >= goal) {
                    statusDiv.classList.add('completed');
                } else {
                    statusDiv.classList.add('incomplete');
                }

                // Aplicar el estado a todos los días de la semana
                const startDayIndex = index - dayOfWeek;
                for (let i = startDayIndex; i <= index; i++) {
                    days[i]?.appendChild(statusDiv.cloneNode());
                }
            }
        });
    };

    // Event listeners
    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    saveBtn.addEventListener('click', () => {
        const date = modalDate.textContent;
        const hours = parseInt(studyHoursInput.value);
        const goal = parseInt(weeklyGoalInput.value);

        if (currentDayElement && !isNaN(hours) && !isNaN(goal)) {
            // Guardar horas de estudio
            studyData[date] = hours;
            currentDayElement.querySelector('.total-hours').textContent = `${hours}h`;

            // Guardar meta semanal
            const weekStartDate = getStartOfWeek(new Date(date));
            weeklyGoals[weekStartDate] = goal;

            // Guardar en localStorage
            localStorage.setItem('studyData', JSON.stringify(studyData));
            localStorage.setItem('weeklyGoals', JSON.stringify(weeklyGoals));
            
            modal.style.display = 'none';
            // Vuelve a renderizar para actualizar el estado semanal
            renderCalendar(); 
        }
    });

    // Iniciar el calendario
    renderCalendar();
});