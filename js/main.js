document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const elements = {
        eventsBody: document.getElementById('events-body'),
        floorFilter: document.getElementById('floor-filter'),
        timeFilter: document.getElementById('time-filter'),
        searchInput: document.getElementById('search-input'),
        dailyParticipants: document.getElementById('daily-participants'),
        monthlyParticipants: document.getElementById('monthly-participants'),
        yearlyParticipants: document.getElementById('yearly-participants'),
        viewCurrentBtn: document.getElementById('view-current'),
        viewUpcomingBtn: document.getElementById('view-upcoming'),
        highlightedRoom: document.getElementById('highlighted-room'),
        currentDateElement: document.getElementById('current-date'),
        pageTitle: document.getElementById('page-title')
    };

    // State
    let currentView = 'today';
    let events = [];

    // Initialize
    init();

    function init() {
        updateCurrentDate();
        loadStats();
        setupEventListeners();
        loadEvents();
    }

    function updateCurrentDate() {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        elements.currentDateElement.textContent = new Date().toLocaleDateString('pt-BR', options);
    }

    function loadStats() {
        const todayEvents = eventDB.getCurrentEvents();
        const totalParticipants = todayEvents.reduce((sum, event) => sum + (event.participants || 0), 0);
        
        elements.dailyParticipants.textContent = totalParticipants;
        elements.monthlyParticipants.textContent = "1500";
        elements.yearlyParticipants.textContent = "750";
    }

    function setupEventListeners() {
        elements.floorFilter.addEventListener('change', filterEvents);
        elements.timeFilter.addEventListener('change', filterEvents);
        elements.searchInput.addEventListener('input', filterEvents);
        
        elements.viewCurrentBtn.addEventListener('click', () => {
            currentView = 'today';
            updateActiveButton();
            loadEvents();
        });
        
        elements.viewUpcomingBtn.addEventListener('click', () => {
            currentView = 'upcoming';
            updateActiveButton();
            loadEvents();
        });
    }

    function updateActiveButton() {
        elements.viewCurrentBtn.classList.toggle('active', currentView === 'today');
        elements.viewUpcomingBtn.classList.toggle('active', currentView === 'upcoming');
        elements.pageTitle.textContent = currentView === 'today' 
            ? `EVENTOS ETSUS - ${elements.currentDateElement.textContent}`
            : 'EVENTOS ETSUS - PRÓXIMOS EVENTOS';
    }

    function loadEvents() {
        events = currentView === 'today' 
            ? eventDB.getCurrentEvents() 
            : eventDB.getUpcomingEvents();
        
        renderEvents(events);
        updateHighlightedRoom();
    }

    function renderEvents(eventsToRender) {
        elements.eventsBody.innerHTML = eventsToRender.length === 0
            ? '<tr><td colspan="4" class="no-events">Nenhum evento encontrado</td></tr>'
            : eventsToRender.map(event => `
                <tr>
                    <td>${event.title}</td>
                    <td>${event.space}</td>
                    <td>${event.floor}</td>
                    <td>${event.startTime} às ${event.endTime}</td>
                </tr>
            `).join('');
    }

    function filterEvents() {
        const floorValue = elements.floorFilter.value;
        const timeValue = elements.timeFilter.value;
        const searchValue = elements.searchInput.value.toLowerCase();
        
        const filteredEvents = events.filter(event => {
            const matchesFloor = !floorValue || event.floor === floorValue;
            const matchesTime = !timeValue || checkTimeFilter(event.startTime, timeValue);
            const matchesSearch = !searchValue || 
                event.title.toLowerCase().includes(searchValue) || 
                event.space.toLowerCase().includes(searchValue);
            
            return matchesFloor && matchesTime && matchesSearch;
        });
        
        renderEvents(filteredEvents);
    }

    function checkTimeFilter(startTime, filter) {
        switch(filter) {
            case 'morning': return startTime >= '07:00' && startTime <= '12:00';
            case 'afternoon': return startTime >= '13:00' && startTime <= '17:00';
            case 'full-day': return startTime === '08:00';
            default: return true;
        }
    }

    function updateHighlightedRoom() {
        if (events.length === 0) {
            elements.highlightedRoom.innerHTML = '';
            return;
        }
        
        const longestEvent = events.reduce((prev, current) => {
            const prevDuration = getDurationInMinutes(prev.startTime, prev.endTime);
            const currDuration = getDurationInMinutes(current.startTime, current.endTime);
            return currDuration > prevDuration ? current : prev;
        });
        
        elements.highlightedRoom.innerHTML = `
            <h3>${longestEvent.space}</h3>
            <div class="room-schedule">
                <span class="time-badge">${longestEvent.startTime} às ${longestEvent.endTime}</span>
                <span>${longestEvent.title}</span>
            </div>
        `;
    }

    function getDurationInMinutes(startTime, endTime) {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    }
});