document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const elements = {
        form: document.getElementById('event-form'),
        formContainer: document.getElementById('form-container'),
        listContainer: document.getElementById('list-container'),
        adminEventsBody: document.getElementById('admin-events-body'),
        listSearch: document.getElementById('list-search'),
        formTitle: document.getElementById('form-title'),
        listTitle: document.getElementById('list-title'),
        btnAddEvent: document.getElementById('btn-add-event'),
        btnViewEvents: document.getElementById('btn-view-events'),
        btnCancel: document.getElementById('btn-cancel'),
        btnSubmit: document.getElementById('btn-submit'),
        btnDelete: document.getElementById('btn-delete'),
        inputs: {
            id: document.getElementById('event-id'),
            title: document.getElementById('event-title'),
            date: document.getElementById('event-date'),
            space: document.getElementById('event-space'),
            floor: document.getElementById('event-floor'),
            participants: document.getElementById('event-participants'),
            startTime: document.getElementById('event-start'),
            endTime: document.getElementById('event-end')
        }
    };

    // State
    let currentEvent = null;
    let isEditing = false;

    // Initialize
    init();

    function init() {
        setupEventListeners();
        showTodayAsDefaultDate();
        showEventList();
    }

    function setupEventListeners() {
        elements.form.addEventListener('submit', handleFormSubmit);
        elements.btnCancel.addEventListener('click', resetForm);
        elements.btnDelete.addEventListener('click', handleDeleteEvent);
        
        elements.btnAddEvent.addEventListener('click', showAddForm);
        elements.btnViewEvents.addEventListener('click', () => showEventList());
        
        elements.listSearch.addEventListener('input', filterEventList);
    }

    function showTodayAsDefaultDate() {
        elements.inputs.date.value = new Date().toISOString().split('T')[0];
    }

    function showAddForm() {
        elements.btnAddEvent.classList.add('active');
        elements.btnViewEvents.classList.remove('active');
        resetForm();
        toggleView('form');
    }

    function showEventList() {
        elements.btnViewEvents.classList.add('active');
        elements.btnAddEvent.classList.remove('active');
        loadEventList();
        toggleView('list');
    }

    function toggleView(view) {
        elements.formContainer.style.display = view === 'form' ? 'block' : 'none';
        elements.listContainer.style.display = view === 'list' ? 'block' : 'none';
    }

    function loadEventList() {
        const events = eventDB.getAllEvents();
        renderEventList(events);
    }

    function renderEventList(events) {
        if (events.length === 0) {
            elements.adminEventsBody.innerHTML = '<tr><td colspan="5" class="no-events">Nenhum evento cadastrado</td></tr>';
            return;
        }

        elements.adminEventsBody.innerHTML = events
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(event => `
                <tr ${event.isPast ? 'class="past-event"' : ''}>
                    <td>${event.title}</td>
                    <td>${formatDateForDisplay(event.date)}</td>
                    <td>${event.startTime} às ${event.endTime}</td>
                    <td>${event.space}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${event.id}">Editar</button>
                        <button class="action-btn delete-btn" data-id="${event.id}">Excluir</button>
                    </td>
                </tr>
            `).join('');

        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editEvent(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteEvent(btn.dataset.id));
        });
    }

    function filterEventList() {
        const searchValue = elements.listSearch.value.toLowerCase();
        const events = eventDB.getAllEvents().filter(event => 
            event.title.toLowerCase().includes(searchValue) || 
            event.space.toLowerCase().includes(searchValue)
        );
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

        // Fill form with event data
        elements.inputs.id.value = event.id;
        elements.inputs.title.value = event.title;
        elements.inputs.date.value = event.date;
        elements.inputs.space.value = event.space;
        elements.inputs.floor.value = event.floor;
        elements.inputs.participants.value = event.participants || '';
        elements.inputs.startTime.value = event.startTime;
        elements.inputs.endTime.value = event.endTime;

        // Update UI
        elements.formTitle.textContent = 'Editar Evento';
        elements.btnSubmit.textContent = 'Atualizar';
        elements.btnDelete.style.display = 'inline-block';

        showAddForm();
    }

    function confirmDeleteEvent(eventId) {
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            eventDB.deleteEvent(eventId);
            loadEventList();
            if (isEditing && currentEvent && currentEvent.id === eventId) {
                resetForm();
                showEventList();
            }
        }
    }

    function handleDeleteEvent() {
        if (currentEvent) {
            confirmDeleteEvent(currentEvent.id);
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        // Form validation
        if (!validateForm()) return;

        const eventData = {
            title: elements.inputs.title.value.trim(),
            date: elements.inputs.date.value,
            space: elements.inputs.space.value.trim(),
            floor: elements.inputs.floor.value,
            participants: elements.inputs.participants.value ? parseInt(elements.inputs.participants.value) : null,
            startTime: elements.inputs.startTime.value,
            endTime: elements.inputs.endTime.value
        };

        if (isEditing) {
            eventDB.updateEvent(currentEvent.id, eventData);
            alert('Evento atualizado com sucesso!');
        } else {
            eventDB.addEvent(eventData);
            alert('Evento cadastrado com sucesso!');
        }

        resetForm();
        showEventList();
    }

    function validateForm() {
        // Check required fields
        if (!elements.inputs.title.value.trim() || 
            !elements.inputs.date.value || 
            !elements.inputs.space.value.trim() || 
            !elements.inputs.floor.value) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return false;
        }

        // Check time validity
        if (elements.inputs.startTime.value >= elements.inputs.endTime.value) {
            alert('O horário de término deve ser após o horário de início!');
            return false;
        }

        // Check if date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(elements.inputs.date.value);
        
        if (eventDate < today && !confirm('Este evento está marcado para uma data passada. Deseja continuar?')) {
            return false;
        }

        return true;
    }

    function resetForm() {
        elements.form.reset();
        elements.inputs.id.value = '';
        currentEvent = null;
        isEditing = false;

        elements.formTitle.textContent = 'Adicionar Novo Evento';
        elements.btnSubmit.textContent = 'Salvar';
        elements.btnDelete.style.display = 'none';

        showTodayAsDefaultDate();
    }

    function formatDateForDisplay(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
});