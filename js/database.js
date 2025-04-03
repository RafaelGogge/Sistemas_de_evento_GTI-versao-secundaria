class EventDatabase {
    constructor() {
        this.loadEvents();
    }

    loadEvents() {
        this.events = JSON.parse(localStorage.getItem('etsus-events')) || [];
        if (this.events.length === 0) {
            this.initializeSampleData();
        } else {
            this.updatePastEvents();
        }
    }

    initializeSampleData() {
        const today = this.formatDate(new Date());
        this.events = [
            {
                id: this.generateId(),
                title: "ESPECIALIZAÇÃO EM EDUCAÇÃO NA SAÚDE PARA PRECEPTORES DO SUS - PSUS",
                space: "Lab. informática",
                floor: "1º",
                startTime: "07:00",
                endTime: "12:00",
                date: today,
                participants: 25,
                isPast: false
            },
            {
                id: this.generateId(),
                title: "ASSEMBLÉIA COSEMSYES",
                space: "Auditório",
                floor: "3º",
                startTime: "08:00",
                endTime: "16:00",
                date: today,
                participants: 50,
                isPast: false
            }
        ];
        this.save();
    }

    getAllEvents() {
        return [...this.events];
    }

    getEventById(id) {
        return this.events.find(event => event.id === id);
    }

    getCurrentEvents() {
        const today = this.formatDate(new Date());
        return this.events.filter(event => event.date === today && !event.isPast);
    }

    getUpcomingEvents() {
        const today = this.formatDate(new Date());
        return this.events
            .filter(event => event.date >= today && !event.isPast)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    addEvent(eventData) {
        const newEvent = {
            id: this.generateId(),
            ...eventData,
            isPast: this.checkIfPast(eventData.date, eventData.endTime)
        };
        this.events.push(newEvent);
        this.save();
        return newEvent;
    }

    updateEvent(id, eventData) {
        const index = this.events.findIndex(event => event.id === id);
        if (index !== -1) {
            this.events[index] = {
                ...this.events[index],
                ...eventData,
                isPast: this.checkIfPast(eventData.date, eventData.endTime)
            };
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

    updatePastEvents() {
        this.events.forEach(event => {
            event.isPast = this.checkIfPast(event.date, event.endTime);
        });
        this.save();
    }

    checkIfPast(eventDate, endTime) {
        const today = new Date();
        const eventDay = new Date(eventDate);
        
        if (eventDay < today) return true;
        if (eventDay > today) return false;
        
        const [hours, minutes] = endTime.split(':').map(Number);
        const endTimeDate = new Date();
        endTimeDate.setHours(hours, minutes, 0, 0);
        
        return today > endTimeDate;
    }

    save() {
        localStorage.setItem('etsus-events', JSON.stringify(this.events));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    formatDate(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }
}

const eventDB = new EventDatabase();