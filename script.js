flatpickr("#dueDate", {
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "F j, Y",
});

flatpickr("#dueTime", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    altInput: true,
    altFormat: "H:i",
});

const taskTitleInput = document.getElementById('taskTitle');
const dueDateInput = document.getElementById('dueDate');
const dueTimeInput = document.getElementById('dueTime');
const taskDescriptionInput = document.getElementById('taskDescription');
const enableRemindersCheckbox = document.getElementById('enableReminders');
const deadlineListDiv = document.getElementById('deadlineList');
const calendarSectionDiv = document.getElementById('calendarSection');
const remindersSectionDiv = document.getElementById('remindersSection');
const toggleViewButton = document.getElementById('toggleView');
const calendarGridDiv = document.getElementById('calendarGrid');
const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthCalendarButton = document.getElementById('prevMonthCalendar');
const nextMonthCalendarButton = document.getElementById('nextMonthCalendar');
const dayDeadlinesDiv = document.getElementById('dayDeadlines');

let deadlines = JSON.parse(localStorage.getItem('taskDeadlines') || '[]');
let currentDate = new Date();

function formatDateForCalendar(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function calculateTimeRemaining(targetTime) {
    const now = new Date();
    const target = new Date(targetTime);
    const diff = target - now;

    if (diff <= 0) return "Time's up!";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function addDeadline() {
    const title = taskTitleInput.value;
    const date = dueDateInput.value;
    const time = dueTimeInput.value;
    const description = taskDescriptionInput.value;
    const remindersEnabled = enableRemindersCheckbox.checked;

    if (title && date && time) {
        const dateTime = `${date} ${time}`;
        const newDeadline = { title, dateTime, description, remindersEnabled };
        deadlines.push(newDeadline);
        localStorage.setItem('taskDeadlines', JSON.stringify(deadlines));
        taskTitleInput.value = '';
        dueDateInput.value = '';
        dueTimeInput.value = '';
        taskDescriptionInput.value = '';
        displayDeadlines();
        displayCalendar();
    } else {
        alert('Please enter a task title, due date, and due time.');
    }
}

function displayCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayIndex = firstDayOfMonth.getDay();

    calendarGridDiv.innerHTML = '';
    dayDeadlinesDiv.innerHTML = '';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.textContent = day;
        dayLabel.className = 'calendar-header-cell';
        calendarGridDiv.appendChild(dayLabel);
    });

    for (let i = 0; i < 42; i++) {
        const dayOffset = i - firstDayIndex;
        const currentDay = new Date(year, month, 1 + dayOffset);

        if (currentDay.getMonth() === month) {
            const dayCell = document.createElement('div');
            dayCell.textContent = currentDay.getDate();
            dayCell.className = 'calendar-day';

            const today = new Date();
            if (currentDay.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }

            const formattedDate = formatDateForCalendar(currentDay);
            const hasDeadlines = deadlines.some(d => d.dateTime.startsWith(formattedDate));
            if (hasDeadlines) {
                dayCell.classList.add('has-deadline');
            }

            dayCell.addEventListener('click', () => showDeadlinesForDay(formattedDate, currentDay));
            calendarGridDiv.appendChild(dayCell);
        } else {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarGridDiv.appendChild(emptyCell);
        }
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    currentMonthYearSpan.textContent = `${monthNames[month]} ${year}`;
}

function showDeadlinesForDay(formattedDate, dateObject) {
    const dailyDeadlines = deadlines.filter(deadline => deadline.dateTime.startsWith(formattedDate));
    dayDeadlinesDiv.innerHTML = '';
    if (dailyDeadlines.length > 0) {
        const heading = document.createElement('h4');
        heading.textContent = `Deadlines for ${dateObject.toLocaleDateString()}`;
        dayDeadlinesDiv.appendChild(heading);
        const ul = document.createElement('ul');
        dailyDeadlines.forEach(deadline => {
            const li = document.createElement('li');
            const deadlineTime = new Date(deadline.dateTime).toLocaleTimeString();
            li.textContent = `${deadline.title} (${deadlineTime})`;
            ul.appendChild(li);
        });
        dayDeadlinesDiv.appendChild(ul);
    } else {
        const message = document.createElement('p');
        message.textContent = `No deadlines for ${dateObject.toLocaleDateString()}.`;
        dayDeadlinesDiv.appendChild(message);
    }
}

function displayDeadlines() {
    deadlineListDiv.innerHTML = '';
    if (deadlines.length === 0) {
        deadlineListDiv.innerHTML = '<p class="text-gray-600 italic">No deadlines added yet.</p>';
        return;
    }
    deadlines.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    deadlines.forEach((deadline, index) => {
        const deadlineItem = document.createElement('div');
        deadlineItem.className = 'bg-white bg-opacity-90 rounded-md shadow-sm p-3 text-gray-800 fade-effect';
        const deadlineDateTime = new Date(deadline.dateTime);
        const formattedDateTime = `${deadlineDateTime.toLocaleDateString()} ${deadlineDateTime.toLocaleTimeString()}`;
        const timeLeftElementId = `time-left-${index}`;
        deadlineItem.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold text-lg mb-1">${deadline.title}</h3>
                    <p class="text-sm text-gray-700">${formattedDateTime}</p>
                    ${deadline.description ? `<p class="text-sm text-gray-700 mt-1">${deadline.description}</p>` : ''}
                    <p class="text-sm text-teal-600 mt-1"><span id="${timeLeftElementId}"></span></p>
                </div>
                <button onclick="removeDeadline(${index})" class="text-red-500 hover:text-red-700 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h12a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 012 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </button>
            </div>
        `;
        deadlineListDiv.appendChild(deadlineItem);
    });

    // Start the timer updates
    updateTimers();
}

function updateTimers() {
    deadlines.forEach((deadline, index) => {
        const timeLeftElement = document.getElementById(`time-left-${index}`);
        if (timeLeftElement) {
            timeLeftElement.textContent = `⏳ ${calculateTimeRemaining(deadline.dateTime)}`;
        }
    });
}

function removeDeadline(index) {
    deadlines.splice(index, 1);
    localStorage.setItem('taskDeadlines', JSON.stringify(deadlines));
    displayCalendar();
    displayDeadlines();
}

prevMonthCalendarButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    displayCalendar();
});

nextMonthCalendarButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    displayCalendar();
});

toggleViewButton.addEventListener('click', () => {
    remindersSectionDiv.classList.toggle('reminders-section');
    remindersSectionDiv.classList.toggle('hidden');
    calendarSectionDiv.classList.toggle('calendar-section');
    calendarSectionDiv.classList.toggle('hidden');

    if (calendarSectionDiv.classList.contains('calendar-section')) {
        toggleViewButton.textContent = 'View Deadlines';
        displayCalendar();
    } else {
        toggleViewButton.textContent = 'View Calendar';
        displayDeadlines();
    }
});

calendarSectionDiv.classList.add('hidden');
displayDeadlines();

// Update timers every second
setInterval(updateTimers, 1000);

function checkAndShowReminders() {
    const now = new Date();
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');

    if (now.getHours() === 7 && now.getMinutes() === 0 && now.getDate() !== lastNotificationDate) {
        const upcomingDeadlines = deadlines.filter(deadline => {
            const deadlineDate = new Date(deadline.dateTime);
            return deadlineDate > now;
        });

        if (upcomingDeadlines.length > 0) {
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            }

            if (Notification.permission === "granted") {
                new Notification("Daily Deadline Reminder", {
                    body: `You have ${upcomingDeadlines.length} upcoming deadlines!`,
                    icon: "/icon.png"
                });
            }

            localStorage.setItem('lastNotificationDate', now.getDate());
        }
    }
}

setInterval(() => {
    checkAndShowReminders();
    deadlines.forEach((deadline, index) => {
        if (new Date(deadline.dateTime) < new Date() && deadline.remindersEnabled) {
            deadlines[index].remindersEnabled = false;
            localStorage.setItem('taskDeadlines', JSON.stringify(deadlines));
        }
    });
}, 60000);

// Initial calls
checkAndShowReminders();