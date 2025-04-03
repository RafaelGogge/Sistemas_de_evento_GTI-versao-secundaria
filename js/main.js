document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const eventsBody = document.getElementById('events-body');
    const floorFilter = document.getElementById('floor-filter');
    const timeFilter = document.getElementById('time-filter');
    const searchInput = document.getElementById('search-input');
    const dailyParticipants = document.getElementById('daily-participants');
    const monthlyParticipants = document.getElementById('monthly-participants');
    const yearlyParticipants = document.getElementById('yearly-participants');
    const viewCurrentBtn = document.getElementById('view-current');
    const viewUpcomingBtn = document.getElementById('view-upcoming');
    const highlightedRoom = document.getElementById('highlighted-room');
    const currentDateElement = document.getElementById('current-date');
    const pageTitle = document.getElementById('page-title');
    
    // State
    let currentView = 'today';
    let events = [];
    
    // Initialize the page
    function init() {
        updateCurrentDate();
        loadStats();
        setupEventListeners();
        loadEvents();
    }
    
    function updateCurrentDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        const dateString = today.toLocaleDateString('pt-BR', options);
        currentDateElement.textContent = dateString;
    }
    
    function loadStats() {
        // In a real app, these would come from an API
        dailyParticipants.textContent = "120";
        monthlyParticipants.textContent = "1500";
        yearlyParticipants.textContent = "750";
    }
    
    function setupEventListeners() {
        floorFilter.addEventListener('change', filterEvents);
        timeFilter.addEventListener('change', filterEvents);
        searchInput.addEventListener('input', filterEvents);
        
        viewCurrentBtn.addEventListener('click', () => {
            currentView = 'today';
            viewCurrentBtn.classList.add('active');
            viewUpcomingBtn.classList.remove('active');
            loadEvents();
        });
        
        viewUpcomingBtn.addEventListener('click', () => {
            currentView = 'upcoming';
            viewUpcomingBtn.classList.add('active');
            viewCurrentBtn.classList.remove('active');
            loadEvents();
        });
    }
    
    function loadEvents() {
        if (currentView === 'today') {
            events = eventDB.getCurrentEvents();
            pageTitle.textContent = `EVENTOS ETSUS - ${currentDateElement.textContent}`;
        } else {
            events = eventDB.getUpcomingEvents();
            pageTitle.textContent = 'EVENTOS ETSUS - PRÓXIMOS EVENTOS';
        }
        
        renderEvents(events);
        updateHighlightedRoom();
    }
    
    function renderEvents(eventsToRender) {
        eventsBody.innerHTML = '';
        
        if (eventsToRender.length === 0) {
            eventsBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum evento encontrado</td></tr>';
            return;
        }
        
        eventsToRender.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.title}</td>
                <td>${event.description || '-'}</td>
                <td>${event.space}</td>
                <td>${event.floor}</td>
                <td>${event.startTime} às ${event.endTime}</td>
                <td>${event.participants || '-'}</td>
            `;
            eventsBody.appendChild(row);
        });
    }
    
    function filterEvents() {
        const floorValue = floorFilter.value;
        const timeValue = timeFilter.value;
        const searchValue = searchInput.value.toLowerCase();
        
        const filteredEvents = events.filter(event => {
            // Filter by floor
            if (floorValue && event.floor !== floorValue) {
                return false;
            }
            
            // Filter by time
            if (timeValue) {
                if (timeValue === 'morning' && !event.startTime.includes('07:00')) {
                    return false;
                }
                if (timeValue === 'afternoon' && !event.startTime.includes('13:00') && 
                    !event.startTime.includes('14:00') && 
                    !event.startTime.includes('15:00')) {
                    return false;
                }
                if (timeValue === 'full-day' && !(event.startTime === '08:00' && event.endTime === '17:00')) {
                    return false;
                }
            }
            
            // Filter by search
            if (searchValue && !event.title.toLowerCase().includes(searchValue) && 
                !event.space.toLowerCase().includes(searchValue) &&
                !(event.description && event.description.toLowerCase().includes(searchValue))) {
                return false;
            }
            
            return true;
        });
        
        renderEvents(filteredEvents);
    }
    
    function updateHighlightedRoom() {
        if (events.length === 0) {
            highlightedRoom.innerHTML = '';
            return;
        }
        
        // Find the room with the longest event today
        const longestEvent = events.reduce((longest, current) => {
            const longestDuration = getDurationInMinutes(longest.startTime, longest.endTime);
            const currentDuration = getDurationInMinutes(current.startTime, current.endTime);
            return currentDuration > longestDuration ? current : longest;
        }, events[0]);
        
        highlightedRoom.innerHTML = `
            <h3>${longestEvent.space}</h3>
            <div class="room-schedule">
                <span class="time-badge">${longestEvent.startTime} às ${longestEvent.endTime}</span>
                <span>${longestEvent.title}</span>
            </div>
        `;
    }
    
    function getDurationInMinutes(startTime, endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    }
    
    // Start the application
    init();
});