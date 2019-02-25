/* jshint strict:false, esversion: 6 */ 

const eleAllPokemon = document.getElementById('pokedex');
const allFilterCheckboxes = document.querySelectorAll('form input[type=checkbox]');

const maxPokemon = 488;
const pokemonNotInGo = [235, 352, 377, 378, 379, 385, 386, 462];
const pokemonRegional = [83, 115, 122, 128, 214, 222, 324, 335, 336, 337, 338, 369, 313, 314, 357, 417, 441, 455];
const pokemonMissing = [128, 150, 154, 182, 214, 217, 222, 235, 243, 250, 271, 272, 275, 282, 289, 298, 314, 321, 324, 330, 334, 336, 350, 352, 357, 358, 359, 369, 371, 372, 373, 377, 378, 379, 381, 392, 402, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 419, 420, 421, 422, 423, 433, 438, 439, 441, 443, 444, 445, 447, 448, 449, 450, 455, 457, 458, 462, 463, 464, 465, 467, 468, 469, 470, 471, 472, 474, 475, 476, 477, 479, 480, 481, 482, 483, 486];

let allPokemon = [];
let pokemonList = [];


function init(){
	populatePokedex();
	initListeners();
}

function populatePokedex(){
	pokemonList = getFullPokemonList();
	allPokemon = cleanFullPokemonList();
	allPokemon = allPokemon.sort(compare);
	setPokedex(allPokemon);
}

function refreshPokedex(filters){
	let allPokemonTemp = allPokemon;

	if(filters.includes('caught')){
		allPokemonTemp = filterPokemon(allPokemonTemp, pokemonMissing);
	}

	if(filters.includes('regional')){
		allPokemonTemp = excludePokemon(allPokemonTemp, pokemonRegional);
	}

	if(filters.includes('not-in-pokemon-go')){
		allPokemonTemp = excludePokemon(allPokemonTemp, pokemonNotInGo);
	}

	setPokedex(allPokemonTemp);
}

function setPokedex(pokemon){
	populate(pokemon, eleAllPokemon);
	PkSpr.process_dom();
}

function filterPokemon(master, filter){
	return master.filter(mon => {
		if(filter.includes(mon.idx)){
			return mon;
		}
	});
}

function excludePokemon(master, filter){
	return master.filter(mon => {
		if(!filter.includes(mon.idx)){
			return mon;
		}
	});
}

function initListeners(){
	for (let i = 0; i < allFilterCheckboxes.length; i++) {
		allFilterCheckboxes[i].addEventListener('change', handleFilterToggle);
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
		return {
			idx: mon.idx,
			fullname: mon.name.eng,
			name: mon.slug.eng
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

		newDom += '<div class="mon' + classes + '">';
		newDom += '<span class="pkspr pkmn-' + array[i].name + '"></span><br />';
		newDom += '<span class="name">' + array[i].fullname + '</span><br />';
		newDom += '<span class="id">' + array[i].idx + '</span></div>';
	}

	element.innerHTML = newDom;
}

init();