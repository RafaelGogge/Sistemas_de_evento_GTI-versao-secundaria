document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const eventForm = document.getElementById('event-form');
    const eventIdInput = document.getElementById('event-id');
    const eventTitleInput = document.getElementById('event-title');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventDateInput = document.getElementById('event-date');
    const eventSpaceInput = document.getElementById('event-space');
    const eventFloorSelect = document.getElementById('event-floor');
    const eventParticipantsInput = document.getElementById('event-participants');
    const eventStartInput = document.getElementById('event-start');
    const eventEndInput = document.getElementById('event-end');
    const submitBtn = document.getElementById('btn-submit');
    const cancelBtn = document.getElementById('btn-cancel');
    const deleteBtn = document.getElementById('btn-delete');
    
    const addEventBtn = document.getElementById('btn-add-event');
    const viewEventsBtn = document.getElementById('btn-view-events');
    const viewPastBtn = document.getElementById('btn-view-past');
    
    const formContainer = document.getElementById('form-container');
    const listContainer = document.getElementById('list-container');
    const adminEventsBody = document.getElementById('admin-events-body');
    const listSearchInput = document.getElementById('list-search');
    const listFilterSelect = document.getElementById('list-filter');
    const listTitle = document.getElementById('list-title');
    const formTitle = document.getElementById('form-title');
    
    // State
    let currentEvent = null;
    let isEditing = false;
    let currentListView = 'all';
    
    // Initialize the admin panel
    function init() {
        setupEventListeners();
        showTodayAsDefaultDate();
    }
    
    function setupEventListeners() {
        // Form submission
        eventForm.addEventListener('submit', handleFormSubmit);
        cancelBtn.addEventListener('click', resetForm);
        deleteBtn.addEventListener('click', handleDeleteEvent);
        
        // Navigation buttons
        addEventBtn.addEventListener('click', showAddForm);
        viewEventsBtn.addEventListener('click', () => showEventList('all'));
        viewPastBtn.addEventListener('click', () => showEventList('past'));
        
        // List interactions
        listSearchInput.addEventListener('input', filterEventList);
        listFilterSelect.addEventListener('change', filterEventList);
    }
    
    function showTodayAsDefaultDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        eventDateInput.value = `${year}-${month}-${day}`;
    }
    
    function showAddForm() {
        addEventBtn.classList.add('active');
        viewEventsBtn.classList.remove('active');
        viewPastBtn.classList.remove('active');
        
        resetForm();
        formContainer.style.display = 'block';
        listContainer.style.display = 'none';
    }
    
    function showEventList(view) {
        viewEventsBtn.classList.toggle('active', view === 'all');
        viewPastBtn.classList.toggle('active', view === 'past');
        addEventBtn.classList.remove('active');
        
        currentListView = view;
        listTitle.textContent = view === 'past' ? 'Eventos Passados' : 'Todos os Eventos';
        listFilterSelect.value = view;
        
        loadEventList();
        formContainer.style.display = 'none';
        listContainer.style.display = 'block';
    }
    
    function loadEventList() {
        let events;
        
        if (currentListView === 'past') {
            events = eventDB.getAllEvents().filter(event => event.isPast);
        } else if (currentListView === 'all') {
            events = eventDB.getAllEvents();
        } else {
            events = eventDB.getAllEvents().filter(event => !event.isPast);
        }
        
        renderEventList(events);
    }
    
    function renderEventList(events) {
        adminEventsBody.innerHTML = '';
        
        if (events.length === 0) {
            adminEventsBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum evento encontrado</td></tr>';
            return;
        }
        
        // Sort events by date (newest first)
        events.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        events.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.title}</td>
                <td>${formatDateForDisplay(event.date)}</td>
                <td>${event.startTime} às ${event.endTime}</td>
                <td>${event.space}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${event.id}">Editar</button>
                    <button class="action-btn delete-btn" data-id="${event.id}">Excluir</button>
                </td>
            `;
            
            if (event.isPast) {
                row.style.opacity = '0.7';
            }
            
            adminEventsBody.appendChild(row);
        });
        
        // Add event listeners to the action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editEvent(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteEvent(btn.dataset.id));
        });
    }
    
    function filterEventList() {
        const searchValue = listSearchInput.value.toLowerCase();
        const filterValue = listFilterSelect.value;
        
        let events;
        
        if (filterValue === 'past') {
            events = eventDB.getAllEvents().filter(event => event.isPast);
        } else if (filterValue === 'current') {
            events = eventDB.getAllEvents().filter(event => !event.isPast);
        } else {
            events = eventDB.getAllEvents();
        }
        
        if (searchValue) {
            events = events.filter(event => 
                event.title.toLowerCase().includes(searchValue) ||
                event.space.toLowerCase().includes(searchValue) ||
                (event.description && event.description.toLowerCase().includes(searchValue))
            );
        }
        
        renderEventList(events);
    }
    
    function editEvent(eventId) {
        const event = eventDB.getEventById(eventId);
        
        if (!event) {
            alert('Evento não encontrado!');
            return;
        }
        
        currentEvent = event;
        isEditing = true;
        
        // Fill the form with event data
        eventIdInput.value = event.id;
        eventTitleInput.value = event.title;
        eventDescriptionInput.value = event.description || '';
        eventDateInput.value = event.date;
        eventSpaceInput.value = event.space;
        eventFloorSelect.value = event.floor;
        eventParticipantsInput.value = event.participants || '';
        eventStartInput.value = event.startTime;
        eventEndInput.value = event.endTime;
        
        // Update UI
        formTitle.textContent = 'Editar Evento';
        submitBtn.textContent = 'Atualizar Evento';
        deleteBtn.style.display = 'inline-block';
        
        // Show the form
        addEventBtn.classList.add('active');
        viewEventsBtn.classList.remove('active');
        viewPastBtn.classList.remove('active');
        formContainer.style.display = 'block';
        listContainer.style.display = 'none';
    }
    
    function confirmDeleteEvent(eventId) {
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            eventDB.deleteEvent(eventId);
            loadEventList();
        }
    }
    
    function handleDeleteEvent() {
        if (currentEvent && confirm('Tem certeza que deseja excluir este evento?')) {
            eventDB.deleteEvent(currentEvent.id);
            resetForm();
            showEventList(currentListView);
        }
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const eventData = {
            title: eventTitleInput.value.trim(),
            description: eventDescriptionInput.value.trim(),
            date: eventDateInput.value,
            space: eventSpaceInput.value.trim(),
            floor: eventFloorSelect.value,
            participants: eventParticipantsInput.value ? parseInt(eventParticipantsInput.value) : null,
            startTime: eventStartInput.value,
            endTime: eventEndInput.value
        };
        
        // Validate time
        if (eventData.startTime >= eventData.endTime) {
            alert('O horário de término deve ser após o horário de início!');
            return;
        }
        
        if (isEditing) {
            // Update existing event
            eventDB.updateEvent(eventIdInput.value, eventData);
            alert('Evento atualizado com sucesso!');
        } else {
            // Add new event
            eventDB.addEvent(eventData);
            alert('Evento adicionado com sucesso!');
        }
        
        resetForm();
        showEventList(currentListView);
    }
    
    function resetForm() {
        eventForm.reset();
        eventIdInput.value = '';
        currentEvent = null;
        isEditing = false;
        
        formTitle.textContent = 'Adicionar Novo Evento';
        submitBtn.textContent = 'Salvar Evento';
        deleteBtn.style.display = 'none';
        
        showTodayAsDefaultDate();
    }
    
    function formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
    
    // Initialize the admin panel
    init();
});