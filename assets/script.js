/* jshint strict:false, esversion: 6 */

const elePokemonAll = document.getElementById('pokedex');
const allFilterCheckboxes = document.querySelectorAll('form input[type=checkbox]');

const eleControls = document.getElementById('controls');
const eleControlEdit = document.getElementById('control-edit');
const eleControlShare = document.getElementById('control-share');
const eleControlCancel = document.getElementById('control-cancel');
const eleControlMissing = document.getElementById('control-add-missing');
const eleControlCaught = document.getElementById('control-add-caught');
const eleControlFilters = document.getElementById('control-filters-toggle');
const eleControlFiltersList = document.getElementById('control-filters-list');

const eleModalOverlay = document.getElementById('modalOverlay');
const eleShareModal = document.getElementById('shareModal');
const eleShareModalLink = document.getElementById('shareModalLink');
const eleCopyLink = document.getElementById('copy-link');
const eleSharedStatus = document.getElementById('shared-status');
const eleSharedStatusLink = document.getElementById('shared-status-link');

const maxPokemon = 809;
const versionInclusions = [
	'alola',
	'attack',
	'defense',
	'speed',
	'origin',
	'sunny',
	'snowy',
	'cloudy',
	'rainy',
	'sandy',
	'trash',
	'question',
	'exclamation',
	'sunshine',
	'east',
	'blue-striped',
	'zen',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z'
];
const pokemonAlternateForms = [];
const pokemonNotInGo = [
	'201-j',
	'201-q',
	'201-z',
	'201-question',
	352,
	479,
	489,
	490,
	492,
	493,
	494,
	517,
	518,
	540,
	541,
	542,
	546,
	547,
	548,
	549,
	551,
	552,
	553,
	570,
	571,
	574,
	575,
	576,
	577,
	578,
	579,
	580,
	581,
	582,
	583,
	584,
	585,
	586,
	587,
	592,
	593,
	602,
	603,
	604,
	605,
	606,
	618,
	619,
	620,
	621,
	624,
	625,
	626,
	629,
	630,
	636,
	637,
	643,
	644,
	645,
	646,
	647,
	648,
	649,
	650,
	651,
	652,
	653,
	654,
	655,
	656,
	657,
	658,
	659,
	660,
	661,
	662,
	663,
	664,
	665,
	666,
	667,
	668,
	669,
	670,
	671,
	672,
	673,
	674,
	675,
	676,
	677,
	678,
	679,
	680,
	681,
	682,
	683,
	684,
	685,
	686,
	687,
	688,
	689,
	690,
	691,
	692,
	693,
	694,
	695,
	696,
	697,
	698,
	699,
	700,
	701,
	702,
	703,
	704,
	705,
	706,
	707,
	708,
	709,
	710,
	711,
	712,
	713,
	714,
	715,
	716,
	717,
	718,
	719,
	720,
	721,
	722,
	723,
	724,
	725,
	726,
	727,
	728,
	729,
	730,
	731,
	732,
	733,
	734,
	735,
	736,
	737,
	738,
	739,
	740,
	741,
	742,
	743,
	744,
	745,
	746,
	747,
	748,
	749,
	750,
	751,
	752,
	753,
	754,
	755,
	756,
	757,
	758,
	759,
	760,
	761,
	762,
	763,
	764,
	765,
	766,
	767,
	768,
	769,
	770,
	771,
	772,
	773,
	774,
	775,
	776,
	777,
	778,
	779,
	780,
	781,
	782,
	783,
	784,
	785,
	786,
	787,
	788,
	789,
	790,
	791,
	792,
	793,
	794,
	795,
	796,
	797,
	798,
	799,
	800,
	801,
	802,
	803,
	804,
	805,
	806,
	807
];
const pokemonRegional = [
	83,
	115,
	122,
	128,
	214,
	222,
	324,
	335,
	336,
	337,
	338,
	369,
	313,
	314,
	357,
	417,
	439,
	441,
	455,
	480,
	481,
	482,
	511,
	512,
	513,
	514,
	515,
	516,
	538,
	539,
	550,
	'550-blue-striped',
	556,
	561,
	631,
	632
];

let isShared = getParameterByName('shared');
let editActive = false;
let pokemonAll = [];
let pokemonList = [];
let pokemonMissing = [];
let allPokemonBoxes;

function init() {
	getAllPokemon();
	getStorageData();
	populatePokedex();
	initListeners();
}

function getAllPokemon() {
	pokemonList = getFullPokemonList();
	pokemonAll = cleanFullPokemonList();
	pokemonAll = pokemonAll.sort(compare);
}

function getStorageData() {
	if (isShared) {
		pokemonMissing = JSON.parse(getParameterByName('missing'));
	} else {
		if (localStorage.getItem('pokemonMissing') !== null) {
			var json_data = JSON.parse(localStorage.getItem('pokemonMissing'));
			for (var i in json_data) {
				pokemonMissing.push(json_data[i]);
			}
		} else {
			pokemonMissing = pokemonAll.map(mon => mon.idx);
		}
	}
}

function updateLocalStorage() {
	localStorage.setItem('pokemonMissing', JSON.stringify(pokemonMissing));
}

function populatePokedex() {
	getAllPokemon();
	handleFilterToggle();
}

function refreshPokedex(filters) {
	let pokemonAllTemp = pokemonAll;

	if (filters.includes('caught')) {
		pokemonAllTemp = excludePokemon(pokemonAllTemp, calculateCaughtPokemon());
	}
	if (filters.includes('missing')) {
		pokemonAllTemp = excludePokemon(pokemonAllTemp, pokemonMissing);
	}
	if (filters.includes('regional')) {
		pokemonAllTemp = excludePokemon(pokemonAllTemp, pokemonRegional);
	}
	if (filters.includes('not-in-pokemon-go')) {
		pokemonAllTemp = excludePokemon(pokemonAllTemp, pokemonNotInGo);
	}
	if (filters.includes('alternate-forms')) {
		pokemonAllTemp = excludePokemon(pokemonAllTemp, pokemonAlternateForms);
	}
	if (filters.includes('have-base-evolution')) {
		pokemonAllTemp = excludeScanPokemon(pokemonAllTemp, pokemonMissing);
	}

	setPokedex(pokemonAllTemp);
}

function calculateCaughtPokemon() {
	return pokemonAll.map(mon => {
		if (!pokemonMissing.includes(mon.idx)) {
			return mon.idx;
		}
		return;
	});
}

function setPokedex(pokemon) {
	populate(pokemon, elePokemonAll);
	PkSpr.process_dom();
	initPokemonBoxListeners();
}

function excludePokemon(master, filter) {
	return master.filter(mon => {
		if (!filter.includes(mon.idx)) {
			return mon;
		}
	});
}

function excludeScanPokemon(master, filter) {
	let caughtBaseEvolution = [];

	master.filter(mon => {
		if (mon.base_evolution !== 0) {
			if (!filter.includes(mon.base_evolution)) {
				caughtBaseEvolution.push(mon.idx);
			}
		}
	});

	return master.filter(mon => {
		if (!caughtBaseEvolution.includes(mon.idx)) {
			return mon;
		}
	});
}

function initListeners() {
	for (let i = 0; i < allFilterCheckboxes.length; i++) {
		allFilterCheckboxes[i].addEventListener('change', handleFilterToggle);
	}

	eleControlFilters.addEventListener('click', handleFiltersClick);

	if (isShared === 'true') {
		eleControls.classList.add('hide');
		eleSharedStatus.classList.remove('hide');
		eleSharedStatusLink.href = window.location.pathname;
		return;
	}

	eleControlEdit.addEventListener('click', handleEditClick);
	eleControlShare.addEventListener('click', handleShareClick);
	eleControlCancel.addEventListener('click', handleCancelClick);
	eleControlMissing.addEventListener('click', handleMissingClick);
	eleControlCaught.addEventListener('click', handleCaughtClick);
	eleModalOverlay.addEventListener('click', handleModalClick);
	eleCopyLink.addEventListener('click', handleCopyLinkClick);
}

function handleFiltersClick() {
	eleControlFilters.classList.toggle('close');
	eleControlFiltersList.classList.toggle('close');
	elePokemonAll.classList.toggle('close');
}

function handleEditClick() {
	editActive = true;
	eleControlEdit.classList.add('hide');
	eleControlShare.classList.add('hide');
	eleControlCancel.classList.remove('hide');
	eleControlMissing.classList.remove('hide');
	eleControlCaught.classList.remove('hide');
}

function handleShareClick() {
	var baseURL = window.location.href;
	eleShareModalLink.value = baseURL + '?shared=true&missing=' + JSON.stringify(pokemonMissing);
	eleModalOverlay.classList.remove('hide');
	eleShareModal.classList.remove('hide');
	document.body.classList.add('lockOverflow');
}

function handleCopyLinkClick() {
	eleShareModalLink.select();
	document.execCommand('copy');
}

function handleModalClick() {
	eleModalOverlay.classList.add('hide');
	eleShareModal.classList.add('hide');
	document.body.classList.remove('lockOverflow');
}

function handleCancelClick() {
	getSelectedMons();
	editActive = false;
	eleControlEdit.classList.remove('hide');
	eleControlShare.classList.remove('hide');
	eleControlCancel.classList.add('hide');
	eleControlMissing.classList.add('hide');
	eleControlCaught.classList.add('hide');
}

function handleMissingClick() {
	var selectedMons = getSelectedMons();

	for (var i = 0; i < selectedMons.length; i++) {
		var idx = selectedMons[i].indexOf('-') > 0 ? selectedMons[i] : parseInt(selectedMons[i]);
		if (!pokemonMissing.includes(idx)) {
			pokemonMissing.push(idx);
		}
	}

	updateLocalStorage();
	handleFilterToggle();
	handleCancelClick();
}

function handleCaughtClick() {
	var selectedMons = getSelectedMons();

	for (var i = 0; i < selectedMons.length; i++) {
		var idx = selectedMons[i].indexOf('-') > 0 ? selectedMons[i] : parseInt(selectedMons[i]);

		if (pokemonMissing.includes(idx)) {
			pokemonMissing.splice(pokemonMissing.indexOf(idx), 1);
		}
	}

	updateLocalStorage();
	handleFilterToggle();
	handleCancelClick();
}

function getSelectedMons() {
	allPokemonBoxes = document.querySelectorAll('.mon.selected');
	var selectedMons = [];

	for (var i = 0; i < allPokemonBoxes.length; i++) {
		selectedMons.push(allPokemonBoxes[i].dataset.idx);
		allPokemonBoxes[i].classList.remove('selected');
	}

	return selectedMons;
}

function initPokemonBoxListeners() {
	allPokemonBoxes = document.getElementsByClassName('mon');

	for (let i = 0; i < allPokemonBoxes.length; i++) {
		allPokemonBoxes[i].addEventListener('click', handleMonToggle, true);
	}
}

function handleFilterToggle() {
	let filtersArr = [];
	for (let i = 0; i < allFilterCheckboxes.length; i++) {
		if (!allFilterCheckboxes[i].checked) {
			filtersArr.push(allFilterCheckboxes[i].name);
		}
	}
	refreshPokedex(filtersArr);
}

function handleMonToggle(e) {
	if (editActive) {
		e.currentTarget.classList.toggle('selected');
	}
}

function getFullPokemonList() {
	let newData = JSON.parse(data);
	return Object.values(newData);
}

function cleanFullPokemonList() {
	return extract(pokemonList, 1, maxPokemon);
}

function extract(array, min, max) {
	var list = [];
	array
		.filter(mon => {
			if (mon.idx >= min && mon.idx <= max) {
				return mon;
			}
		})
		.map(mon => {
			var be = mon.base_evolution ? mon.base_evolution : 0;
			var originalMon = {
				idx: mon.idx,
				number: mon.idx,
				fullname: mon.name.eng,
				name: mon.slug.eng,
				base_evolution: be,
				class: ''
			};

			list.push(originalMon);

			var keys = Object.keys(mon.icons);

			if (keys.length > 1) {
				for (var key of keys) {
					if (versionInclusions.includes(key)) {
						var monAlternate = {
							idx: mon.idx + '-' + key,
							number: mon.idx,
							fullname: mon.name.eng,
							name: mon.slug.eng,
							base_evolution: be,
							class: 'form-' + key
						};

						list.push(monAlternate);
						pokemonAlternateForms.push(mon.idx + '-' + key);
					}
				}
			}
		});
	return list;
}

function compare(a, b) {
	if (a.number < b.number) return -1;
	if (a.number > b.number) return 1;
	return 0;
}

function populate(array, element) {
	let newDom = '';

	for (let i = 0; i < array.length; i++) {
		let classes = '';
		let name = array[i].fullname;

		if (pokemonNotInGo.includes(array[i].idx)) {
			classes += ' not-in-pokemon-go';
		}

		if (pokemonRegional.includes(array[i].idx)) {
			classes += ' regional';
		}

		if (pokemonMissing.includes(array[i].idx)) {
			classes += ' missing';
		}

		if (array[i].class !== '') {
			var typeName = array[i].class.split('-')[1];

			switch (typeName) {
				case 'exclamation':
					typeName = '!';
					break;
				case 'question':
					typeName = '?';
					break;
			}
			name += "<br /><span class='sub'>" + typeName + '</span>';
			classes += ' alternate-forms';
		}

		//add data attr for dex number
		newDom += '<div class="mon' + classes + '" data-idx="' + array[i].idx + '">';
		newDom += '<span class="pkspr pkmn-' + array[i].name + ' ' + array[i].class + '"></span><br />';
		newDom += '<span class="name">' + name + '</span><br />';
		newDom += '<span class="id">' + array[i].number + '</span></div>';
	}

	element.innerHTML = newDom;
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

init();
