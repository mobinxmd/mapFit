//// --- variables --- //////


const form = document.querySelector('#form');
const inputDistance = document.querySelector(".input-distance");
const inputCadence = document.querySelector(".input-cadence");
const inputDuration = document.querySelector(".input-duration");
const inputElevation = document.querySelector(".input-elevation");
const selectType = document.querySelector('.select-type');
const workoutContainer = document.querySelector('.workouts');
const resetBtn = document.querySelector('#resetBtn');
const deleteBtns = document.querySelectorAll('.deleteBtn');




//// --- variables End --- //////
class Workout{
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords,distance, duration ){
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
        
        
    }

    _getDescription(){
        const months = ['January',"February", 'March', 'April', 'May', 'June', 'July', 'August', 'September', "October", "November", "December" ]
       this.description= `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
};

class Running extends Workout{
    type = 'running';
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._getDescription();
    }

    calcPace(){
        this.pace = this.duration / this.distance;
    }


}
class Cycling extends Workout{
    type = 'cycling';
    constructor(coords, distance, duration, ElevationGain){
        super(coords, distance, duration);
        this.ElevationGain = ElevationGain;
        this.calcSpeed();
        this._getDescription();
    }

    calcSpeed(){
         this.speed = this.distance / (this.duration / 60);
    }
}


///////////// Architecture ////////////////////////

class App{
    #map;
    #mapEvent;
    #workouts = [];
    constructor(){
        // get users map position  ---- ////
        this._getPosition();
        // get user's data to local storage ---- ///
        this._getLocalStorageData();
        // Event handlers ---- -------///
        this._toggleResetBtn();
        form.addEventListener('submit',this._newWorkout.bind(this));
        selectType.addEventListener('change',this._toggleElevatorField);
        workoutContainer.addEventListener('click', this._moveMapView.bind(this))
        resetBtn.addEventListener('click', this._reset);
       
    }

    _getPosition(){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),()=>{alert('Could not get your location!')});
       
    }
    _loadMap(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const coords = [latitude, longitude];
        this.#map = L.map('map').setView(coords, 13);
    
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
    
        this.#map.on('click', this._showForm.bind(this))

        this.#workouts.forEach((work)=>{
            this._renderMarker(work);
           })
           if(this.#workouts.length === 0)resetBtn.classList.add('hide');
    }
    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove('hide');
        inputDistance.focus();
        resetBtn.classList.add("hide")
    }
    _toggleElevatorField(){
        inputCadence.closest('.form__row').classList.toggle('hide');
        inputElevation.closest('.form__row').classList.toggle('hide');
    }
    
    _newWorkout(e){
        const validInputs = (...inputs)=> inputs.every(inp=> Number.isFinite(inp));
        const isPositive = (...inputs)=> inputs.every(inp => inp > 0);
        
        e.preventDefault();
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const type = selectType.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;
       
        
        if(type === 'running'){
            const cadence = +inputCadence.value;
           if(!validInputs(distance,duration,cadence) || !isPositive(distance,duration,cadence))
            return alert('Inputs can only be numbers and Positive');

            workout = new Running([lat, lng], distance, duration, cadence);
            this.#workouts.push(workout);

        }
        if(type === 'cycling'){
            const elevation = +inputElevation.value;
           if( !validInputs(distance,duration,elevation) || !isPositive(distance,duration))
            return alert('Inputs can only be numbers');
            
            workout = new Cycling([lat, lng], distance, duration, elevation);
            this.#workouts.push(workout);
           
        }

        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = null;
        this._renderMarker(workout);
        form.classList.add('hide');
        this._renderWorkouts(workout);
        this._setLocalStorage()
                
    }

    _renderMarker(workout){
       
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            autoClose: false,
            closeButton: true,
            closeOnClick: false,
            className: `${workout.type}-popup`,
        }))
        .setPopupContent((`${workout.type === 'running'? "🏃‍♂️": "🚴‍♀️"}${workout.description}`))
        .openPopup();
        
    }

    _renderWorkouts(workout){
        let html = `
            <li class=" workout grid cursor-pointer relative grid-cols-4 gap-y-2 place-items-center mb-3 text-white p-4 bg-slate-800 rounded-lg workout--${workout.type}" data-id="${workout.id}">
            <button class="text-xs deleteBtn absolute top-1 end-1"><i class="bi bi-x-lg text-gray-400 hover:text-white"></i></button>
            <h2 class="col-span-4 text-white text-lg ">${workout.description}</h2>
            <div>
            <span>${workout.type === 'running'? "🏃‍♂️": "🚴‍♀️"}</span>
            <span>${workout.distance}</span>
            <span class="text-xs">km</span>
            </div>
            <div>
            <span >⏱</span>
            <span >${workout.duration}</span>
            <span class="text-xs">min</span>
            </div>
        `
        if(workout.type === 'running'){
            html += `
                <div>
                <span >⚡️</span>
                <span >${workout.pace.toFixed(1)}</span>
                <span class="text-xs">min/km</span>
            </div>
            <div >
                <span >🦶🏼</span>
                <span >${workout.cadence}</span>
                <span class="text-xs">spm</span>
            </div>
            </li>
            `;
        }

        if(workout.type === 'cycling'){
            html += `
                <div >
                <span >⚡️</span>
                <span >${workout.speed.toFixed(1)}</span>
                <span class="text-xs">km/h</span>
            </div>
            <div>
                <span >⛰</span>
                <span >${workout.ElevationGain}</span>
                <span class="text-xs">m</span>
            </div>
            </li> 
            `;
        }
        form.insertAdjacentHTML('afterend', html);
        this._toggleResetBtn()
    }

    _moveMapView(e){
        const workoutEl = e.target.closest('.workout');
        if(!workoutEl) return;
        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);

        this.#map.setView(workout.coords, 13, {
            animate: true,
            pan:{
                duration: 1
            }
        } )
         form.classList.add('hide');
         this._toggleResetBtn();
         if(e.target.classList.contains("bi-x-lg")){
            this._deleteElement(e);
         }

    }
    _setLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }
    _getLocalStorageData(){
       const data= JSON.parse(localStorage.getItem('workouts'));
       if(!data) return;
       this.#workouts = data;
       this.#workouts.forEach((work)=>{
        this._renderWorkouts(work);
       })
       this._toggleResetBtn();
    }
    _reset(){
            localStorage.removeItem('workouts');
            location.reload();
    }
    _toggleResetBtn(){
        resetBtn.classList.remove('hide');
    }
    _deleteElement(e){
        const targetElementId = e.target.closest(".workout").dataset.id;
        this.#workouts.filter(work=>{
            if(work.id === targetElementId){
                const ind = this.#workouts.indexOf(work);
                this.#workouts.splice(ind,1);
                localStorage.setItem('workouts', JSON.stringify(this.#workouts))
                location.reload();
            }
        
        });   
    }
}

const app = new App();








