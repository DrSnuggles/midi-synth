export const store = {}
store.get = () => {
	let j = JSON.parse( localStorage.getItem('DrSynth') )
	if (!j) j = {}
	store.store = j
	return j
}
store.set = (o) => {
	store.store = {...store.store, ...o}
	localStorage.setItem('DrSynth', JSON.stringify( store.store ) )
}

store.get()
