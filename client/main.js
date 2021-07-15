let menu_release_right = document.getElementsByClassName("menu_release_right")[0];
let release_content_left = document.getElementsByClassName("release_content_left")[0];

let highlights_ul = document.getElementById("highlights_ul");
let features_ul = document.getElementById("features_ul");
let bug_fixes_ul = document.getElementById("bug_fixes_ul");

let id_input_modal = document.getElementById("id");
let author_input_modal = document.getElementById("author");
let highlights_div = document.getElementById("highlights_div");
let features_div = document.getElementById("features_div");
let bug_fixes_div = document.getElementById("bug_fixes_div");

let input_rows_highlight = document.getElementsByClassName("new_input_row_highlight");
let input_rows_features = document.getElementsByClassName("new_input_row_feature");
let input_rows_bug_fixes = document.getElementsByClassName("new_input_row_bug_fixes");

let delete_version_button = document.getElementById("delete_version_button");
let update_version_button = document.getElementById("update_version_button");
let add_version_button = document.getElementById("add_version_button");
let save_button = document.getElementById("save_button");
let back_button = document.getElementById("back_button");

let modal_header = document.getElementById("modal_header");
let refresh_button = document.getElementById("refresh_button");

let span = document.getElementsByClassName("close")[0];
var modal = document.getElementById('modal');


/* Variables */
let currId = "";
let curr_version_object = {};
let add_or_update = "";


/* This function opens the modal for adding new version*/
add_version_button.addEventListener('click', function () {
	open_modal();
});

/* This function opens the modal for updating version*/
update_version_button.addEventListener('click', function () {
	open_modal(currId);
});

/* This function calls delete_version function for deleting the version*/
delete_version_button.addEventListener('click', function () {
	delete_version();
});

/* closes the modal*/
back_button.addEventListener('click', function () {
	close_modal();
});

/* calls to save the new details*/
save_button.addEventListener('click', function () {
	handle_save_button();
});

/* refresh the page */
refresh_button.addEventListener('click', function () {
	location.reload();
});

//
//    Calling Server Functions
//

/* onload function - gets all the id's versions and get the first one  */
fetch('http://localhost:5000/api/get_all_versions_id')
	.then(response => response.json())
	.then(json => {
		for (let i = 0; i < json.length; i++) {
			let divElement = document.createElement('button');
			divElement.setAttribute("onclick", "get_version_by_id(\"" + json[i] + "\")");
			let divElementText = document.createTextNode("release " + json[i]);
			divElement.appendChild(divElementText)
			menu_release_right.appendChild(divElement)
		}
		get_version_by_id(json[0])
	})
	.catch(err => alert('Request Failed', err));



/* This function gets id, calls the server and sets the properties on the release content fields*/
function get_version_by_id(id) {
	fetch('http://localhost:5000/api/get_version/' + id)
		.then(response => response.json())
		.then(json => {
			currId = json.id;
			curr_version_object = json;
			release_content_left.children[0].children[1].innerHTML = json.id;
			release_content_left.children[4].children[1].innerHTML = json.author;
			release_content_left.children[5].children[1].innerHTML = json.release_Date;
			highlights_ul.innerHTML = get_notes(json, "highlights").innerHTML;
			features_ul.innerHTML = get_notes(json, "features").innerHTML;
			bug_fixes_ul.innerHTML = get_notes(json, "bug_fixes").innerHTML;
		})
		.catch(err => alert('Request Failed', err));
}

/* This function deletes version by id */
function delete_version() {
	fetch('http://localhost:5000/api/delete_version/' + currId, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		.then(response => {
			if (response.status == 200) {
				alert('Version was deleted Successfully!')
				location.reload();
			}
		})
		.catch((error) => {
			alert(error);
		});
};


/*This function calls the server for adding the new version */
function add_new_version() {
	let object = {
		id: id_input_modal.value,
		author: author_input_modal.value,
		highlights: get_notes_to_add(input_rows_highlight),
		features: get_notes_to_add(input_rows_features),
		bug_fixes: get_notes_to_add(input_rows_bug_fixes),
	};
	fetch('http://localhost:5000/api/add_version', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(object),
		})
		.then(response => {
			if (response.status == 201) {
				alert('Version was added Successfully!')
				location.reload();
			} else if (response.status == 409) {
				alert('Version id is already exists...')
			}
		})
		.catch((error) => {
			alert(error);
		});
}


/*This function calls the server for updating the current version */
function update_version() {
	let object = {
		highlights: get_notes_to_add(input_rows_highlight),
		features: get_notes_to_add(input_rows_features),
		bug_fixes: get_notes_to_add(input_rows_bug_fixes),
	};
	fetch('http://localhost:5000/api/update_version/' + currId, {
			method: 'PUT',
			body: JSON.stringify(object),
		})
		.then(response => {
			if (response.status == 201) {
				alert('Version was Updated Successfully!');
				close_modal();
				get_version_by_id(currId);
			} else if (response.status == 409) {
				alert('Version id is already exists...')
			}
		})
		.catch((error) => {
			alert(error);
		});
}






//  Help Functions!
//  The Following function are responsible for building the elements dynamically

/* This function gets the values by id for update Release notes on the modal */
function set_values_on_modal() {
	id_input_modal.value = curr_version_object.id;
	id_input_modal.disabled = true;
	author_input_modal.value = curr_version_object.author;
	author_input_modal.disabled = true;

	for (let i = 0; i < curr_version_object.highlights.length; i++) {
		add_input('highlight');
		highlights_div.children[i].children[0].value = curr_version_object.highlights[i];
	}

	for (let i = 0; i < curr_version_object.features.length; i++) {
		add_input('feature');
		features_div.children[i].children[0].value = curr_version_object.features[i];

	}
	for (let i = 0; i < curr_version_object.bug_fixes.length; i++) {
		add_input('bug_fixes');
		bug_fixes_div.children[i].children[0].value = curr_version_object.bug_fixes[i];
	}

}

/* This function gets the type of release note and adds input field and delete button to its div */
function add_input(type) {
	let new_input_row = document.createElement('div');
	new_input_row.setAttribute("class", "new_input_row new_input_row_" + type);
	let new_input_text = document.createElement('input');
	new_input_text.setAttribute("value", "");
	new_input_text.addEventListener('input', function (e) {
		this.setAttribute("value", e.target.value);
	});
	new_input_row.appendChild(new_input_text);

	let button_del = document.createElement('button');
	button_del.innerHTML = "X";
	button_del.setAttribute("class", "button_del");
	button_del.addEventListener('click', function (e) {
		e.currentTarget.parentNode.remove();
	})
	new_input_row.appendChild(button_del);
	if (type === 'highlight') {
		highlights_div.appendChild(new_input_row);
	} else if (type === 'feature') {
		features_div.appendChild(new_input_row);
	} else if (type === 'bug_fixes') {
		bug_fixes_div.appendChild(new_input_row);
	}
}

/* This function checks if the modal is update type or add type */
function handle_save_button() {
	if (add_or_update === 1) {
		update_version()
	} else {
		add_new_version();
	}
}

/* This functions gets the notes for the parameter element which recieves */
function get_notes_to_add(input_rows) {
	let length = input_rows.length;
	let arr_ans = [];
	for (let i = 0; i < length; i++) {
		arr_ans.push(input_rows[i].children[0].value);
	}
	return arr_ans;
}

/* This function gets the json file and type of release note and returns ul element with the notes inside */
function get_notes(json, type) {
	let ulElement = document.createElement('ul');
	for (let i = 0; i < json[type].length; i++) {
		let liElement = document.createElement('li');
		let litext = document.createTextNode(json[type][i]);
		liElement.appendChild(litext);
		ulElement.appendChild(liElement);
	}
	return ulElement;
}




//
//  Modal's Functions
//

/* This function closes the modal */
function open_modal(v) {
	if (arguments.length > 0) {
		modal_header.innerHTML = "Update Version Release";
		set_values_on_modal(v);
		add_or_update = 1;
	} else {
		modal_header.innerHTML = "Adding New Version Release"
		add_or_update = 0;
	}
	modal.style.display = "block";
}

/* This function opens the modal */
function close_modal() {
	modal.style.display = "none";
	highlights_div.innerHTML = '';
	features_div.innerHTML = '';
	bug_fixes_div.innerHTML = '';
	id_input_modal.disabled = false;
	id_input_modal.value = "";
	author_input_modal.disabled = false;
	author_input_modal.value = "";
}

/* closes modal by x button */
span.addEventListener('click', function (e) {
	close_modal();
});

/* closes modal by clicking outside of the modal */
window.onclick = function (event) {
	if (event.target == modal) {
		close_modal();
	}
};