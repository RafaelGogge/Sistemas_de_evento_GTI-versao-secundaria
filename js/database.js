// Simula um banco de dados simples com armazenamento local
class EventDatabase {
    constructor() {
        this.events = JSON.parse(localStorage.getItem('etsus-events')) || [];
        this.loadSampleData();
    }

    loadSampleData() {
        if (this.events.length === 0) {
            const sampleEvents = [
                {
                    id: this.generateId(),
                    title: "ESPECIALIZAÇÃO EM EDUCAÇÃO NA SAÚDE PARA PRECEPTORES DO SUS - PSUS",
                    description: "Curso de especialização para preceptores do SUS",
                    space: "Lab. informática",
                    floor: "1º",
                    startTime: "07:00",
                    endTime: "12:00",
                    date: this.formatDate(new Date()),
                    participants: 25,
                    isPast: false
                },
                {
                    id: this.generateId(),
                    title: "ASSEMBLÉIA COSEMSYES",
                    description: "Reunião geral dos coordenadores",
                    space: "Auditório",
                    floor: "3º",
                    startTime: "08:00",
                    endTime: "16:00",
                    date: this.formatDate(new Date()),
                    participants: 50,
                    isPast: false
                },
                {
                    id: this.generateId(),
                    title: "REUNIÃO DE PLANEJAMENTO 2025 DO SEAS",
                    description: "Planejamento anual do setor",
                    space: "Sala 5",
                    floor: "2º",
                    startTime: "13:00",
                    endTime: "17:00",
                    date: this.formatDate(new Date()),
                    participants: 15,
                    isPast: false
                }
            ];
            this.events = sampleEvents;
            this.save();
        }
    }

    getAllEvents() {
        return this.events;
    }

    getEventById(id) {
        return this.events.find(event => event.id === id);
    }

    getCurrentEvents() {
        const today = this.formatDate(new Date());
        return this.events.filter(event => event.date === today && !event.isPast);
    }

    getUpcomingEvents() {
        const today = new Date();
        const todayStr = this.formatDate(today);
        const futureEvents = this.events.filter(event => event.date >= todayStr && !event.isPast);
        
        // Ordena por data mais próxima
        return futureEvents.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });
    }

    addEvent(eventData) {
        const newEvent = {
            id: this.generateId(),
            ...eventData,
            isPast: false
        };
        this.events.push(newEvent);
        this.save();
        return newEvent;
    }

    updateEvent(id, eventData) {
        const index = this.events.findIndex(event => event.id === id);
        if (index !== -1) {
            this.events[index] = { ...this.events[index], ...eventData };
            this.checkIfPast(this.events[index]);
            this.save();
            return true;
        }
        return false;
    }

    deleteEvent(id) {
        const index = this.events.findIndex(event => event.id === id);
        if (index !== -1) {
            this.events.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    checkIfPast(event) {
        const eventDate = new Date(event.date);
        const today = new Date();
        
        if (eventDate < today) {
            event.isPast = true;
        } else if (eventDate.toDateString() === today.toDateString()) {
            // Se for hoje, verifica o horário
            const now = new Date();
            const endTime = event.endTime.split(':');
            const endTimeDate = new Date();
            endTimeDate.setHours(parseInt(endTime[0]), parseInt(endTime[1]), 0, 0);
            
            if (now > endTimeDate) {
                event.isPast = true;
            }
        }
    }

    save() {
        // Atualiza status de eventos passados
        this.events.forEach(event => this.checkIfPast(event));
        localStorage.setItem('etsus-events', JSON.stringify(this.events));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Cria uma instância global do banco de dados
const eventDB = new EventDatabase();