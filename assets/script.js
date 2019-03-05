/* jshint strict:false, esversion: 6 */ 

const elePokemonAll = document.getElementById('pokedex');
const allFilterCheckboxes = document.querySelectorAll('form input[type=checkbox]');
const eleControlEdit = document.getElementById('control-edit');
const eleControlCancel = document.getElementById('control-cancel');
const eleControlMissing = document.getElementById('control-add-missing');
const eleControlCaught = document.getElementById('control-add-caught');

const maxPokemon = 494;
const pokemonNotInGo = [352, 385, 386, 412, 413, 414, 420, 421, 422, 423, 439, 443, 444, 445, 449, 450, 462, 470, 471, 476, 479, 480, 481, 482, 486, 489, 490, 491, 492, 493, 494];
const pokemonRegional = [83, 115, 122, 128, 214, 222, 324, 335, 336, 337, 338, 369, 313, 314, 357, 417, 441, 455];

let editActive = false;
let pokemonAll = [];
let pokemonList = [];
let pokemonMissing = [];
let allPokemonBoxes;


function init(){
	getAllPokemon();
	getStorageData();
	populatePokedex();
	initListeners();
}

function getAllPokemon(){
	pokemonList = getFullPokemonList();
	pokemonAll = cleanFullPokemonList();
	pokemonAll = pokemonAll.sort(compare);
}

function getStorageData(){
	if(localStorage.getItem('pokemonMissing') !== null){
		var json_data = JSON.parse(localStorage.getItem('pokemonMissing'));
		for(var i in json_data){
			pokemonMissing.push(json_data[i]);
		}
	} else {
		pokemonMissing = pokemonAll.map(mon => mon.idx);
	}
}

function updateLocalStorage(){
	localStorage.setItem('pokemonMissing', JSON.stringify(pokemonMissing));
}

function populatePokedex(){
	getAllPokemon();
	handleFilterToggle();
}

function refreshPokedex(filters){
	let pokemonAllTemp = pokemonAll;

	if(filters.includes('caught')){
		pokemonAllTemp = excludePokemon(pokemonAllTemp, calculateCaughtPokemon());
	}
	if(filters.includes('missing')){
		pokemonAllTemp = excludePokemon(pokemonAllTemp, pokemonMissing);
	}
	if(filters.includes('regional')){
		pokemonAllTemp = excludePokemon(pokemonAllTemp, pokemonRegional);
	}
	if(filters.includes('not-in-pokemon-go')){
		pokemonAllTemp = excludePokemon(pokemonAllTemp, pokemonNotInGo);
	}
	if(filters.includes('have-base-evolution')){
		pokemonAllTemp = excludeScanPokemon(pokemonAllTemp, pokemonMissing);
	}

	setPokedex(pokemonAllTemp);
}

function calculateCaughtPokemon(){
	return pokemonAll.map(mon => {
		if(!pokemonMissing.includes(mon.idx)){
			return mon.idx;
		}
		return;
	});
}

function setPokedex(pokemon){
	populate(pokemon, elePokemonAll);
	PkSpr.process_dom();
	initPokemonBoxListeners();
}

function excludePokemon(master, filter){
	return master.filter(mon => {
		if(!filter.includes(mon.idx)){
			return mon;
		}
	});
}

function excludeScanPokemon(master, filter){
	let caughtBaseEvolution = [];

	master.filter(mon => {
		if(mon.base_evolution !== 0){
			if(!filter.includes(mon.base_evolution)){
				caughtBaseEvolution.push(mon.idx);
			}
		}
	});

	return master.filter(mon => {
		if(!caughtBaseEvolution.includes(mon.idx)){
			return mon;
		}
	});
}

function initListeners(){
	for (let i = 0; i < allFilterCheckboxes.length; i++) {
		allFilterCheckboxes[i].addEventListener('change', handleFilterToggle);
	}

	eleControlEdit.addEventListener('click', handleEditClick);
	eleControlCancel.addEventListener('click', handleCancelClick);
	eleControlMissing.addEventListener('click', handleMissingClick);
	eleControlCaught.addEventListener('click', handleCaughtClick);
}

function handleEditClick(){
	editActive = true;
	eleControlEdit.classList.add('hide');
	eleControlCancel.classList.remove('hide');
	eleControlMissing.classList.remove('hide');
	eleControlCaught.classList.remove('hide');
}

function handleCancelClick(){
	editActive = false;
	eleControlEdit.classList.remove('hide');
	eleControlCancel.classList.add('hide');
	eleControlMissing.classList.add('hide');
	eleControlCaught.classList.add('hide');
}

function handleMissingClick(){
	var selectedMons = getSelectedMons();

	for (var i = 0; i < selectedMons.length; i++) {
		var idx = parseInt(selectedMons[i]);
		if(!pokemonMissing.includes(idx)){
			pokemonMissing.push((idx));
		}
	}

	updateLocalStorage();
	handleFilterToggle();
	handleCancelClick();
}

function handleCaughtClick(){
	var selectedMons = getSelectedMons();

	for (var i = 0; i < selectedMons.length; i++) {
		var idx = parseInt(selectedMons[i]);

		if(pokemonMissing.includes(idx)){
			pokemonMissing.splice(pokemonMissing.indexOf(idx), 1);
		}
	}

	updateLocalStorage();
	handleFilterToggle();
	handleCancelClick();
}

function getSelectedMons(){
	allPokemonBoxes = document.querySelectorAll('.mon.selected');
	var selectedMons = [];
	
	for (var i = 0; i < allPokemonBoxes.length; i++) {
		selectedMons.push(allPokemonBoxes[i].dataset.idx);
		allPokemonBoxes[i].classList.remove('selected');
	}

	return selectedMons;
}

function initPokemonBoxListeners(){
	allPokemonBoxes = document.getElementsByClassName('mon');

	for (let i = 0; i < allPokemonBoxes.length; i++) {
		allPokemonBoxes[i].addEventListener('click', handleMonToggle, true);
	}
}

function handleFilterToggle(){
	let filtersArr = [];
	for (let i = 0; i < allFilterCheckboxes.length; i++) {
		if(!allFilterCheckboxes[i].checked){
			filtersArr.push(allFilterCheckboxes[i].name);
		}
	}
	refreshPokedex(filtersArr);
}

function handleMonToggle(e){
	if(editActive){
		e.currentTarget.classList.toggle('selected');
	}
}

function getFullPokemonList(){
	let newData = JSON.parse(data);
	return Object.values(newData);
}

function cleanFullPokemonList(){
	return extract(pokemonList, 1, maxPokemon);
}

function extract(array, min, max){
	return array.filter(mon => {
		if(mon.idx >= min && mon.idx <= max){
			return mon;
		}
	}).map(mon => {
		var be = (mon.base_evolution) ? mon.base_evolution : 0;
		return {
			idx: mon.idx,
			fullname: mon.name.eng,
			name: mon.slug.eng,
			base_evolution: be
		};
	});
}

function compare(a,b) {
  if (a.idx < b.idx)
    return -1;
  if (a.idx > b.idx)
    return 1;
  return 0;
}

function populate(array, element){
	let newDom = "";

	for (let i = 0; i < array.length; i++) {
		let classes = "";

		if(pokemonNotInGo.includes(array[i].idx)){
			classes += " not-in-pokemon-go";
		}

		if(pokemonRegional.includes(array[i].idx)){
			classes += " regional";
		}

		if(pokemonMissing.includes(array[i].idx)){
			classes += " missing";
		}

		//add data attr for dex number
		newDom += '<div class="mon' + classes + '" data-idx="' + array[i].idx + '">';
		newDom += '<span class="pkspr pkmn-' + array[i].name + '"></span><br />';
		newDom += '<span class="name">' + array[i].fullname + '</span><br />';
		newDom += '<span class="id">' + array[i].idx + '</span></div>';
	}

	element.innerHTML = newDom;
}

init();