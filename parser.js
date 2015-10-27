var cnstCNT_CELL = 4;
var MAX_INT_32 =  2147483647;

function readXML()
{
	var a = document.getElementById("download_link");
	a.style.display = "none";
	var add_button = document.getElementById("add_button");
	add_button.style.display = "inline";
	var xml = new XMLHttpRequest();
	xml.open( 'GET', 'input.xml' , false );
	xml.send();
	var xmlData = xml.responseXML;
	if( xmlData )
	{
		xmlData = ( new DOMParser() ).parseFromString( xml.responseText, 'text/xml' );
		var params = xmlData.getElementsByTagName( "Parameter" );
		console.log(params);
		var output = '<tr><td>Id</td><td>Name</td><td>Description</td><td>Type</td></tr>';
		for( var i = 0; i < params.length; i++ )
		{
			var type = identifyType( params[i].getElementsByTagName( "Type" )[0].textContent );
			var value = params[i].getElementsByTagName( "Value" )[0].textContent;
			var typeField = getFieldByType( type, value );
			var idField = params[i].getElementsByTagName( "Id" )[0].textContent;
			var nameField = params[i].getElementsByTagName( "Name" )[0].textContent;
			var descriptionField = params[i].getElementsByTagName( "Description" )[0].textContent;
			output += '<tr>';
			output += '<td>' + "<input type=\"text\" value=\"" + idField + "\" />" + '</td>';
			output += '<td>' + "<input type=\"text\" value=\"" + nameField + "\" />" + '</td>';
			output += '<td>' + "<input type=\"text\" value=\"" + descriptionField + "\" />" + '</td>';
			output += '<td>' + typeField + '</td>';
			output += "<td><input type=\"button\" value=\"x\" onclick=\"deleteRow(this)\"></td>";
			output += '</tr>';
		}
		document.getElementById( 'table_id' ).innerHTML = output;
	}
}

function identifyType( str )
{
	if( str.indexOf('String') > -1 )
	{
		return 'String';
	}
	else if( str.indexOf('Int') > -1 )
	{
		return 'Int';
	}
	else if( str.indexOf('Boolean') > -1 )
		return 'Boolean';
	return '';
}

function checkNumber( input ) 
{	
	var value = input.value;
	var Reg = new RegExp("^([+-]?)[1-9][0-9]*$");
    if (Reg.test(value) && value <= MAX_INT_32) 
	{
		input.style.color = 'black';
		return true;
	}
	input.style.color = 'red';
	return false;
}

function getFieldByType( type, value )
{
	switch ( type ) 
	{
		case 'String':
		if( value === "" )
			return "<input type=\"text\" />";
			return "<input type=\"text\" value=" + value + " />";
		case 'Int':
			return "<input type=\"number\" onchange=\"return checkNumber(this);\" value=" + value + " />";
		case 'Boolean':
			var val_checkbox = "";
			if( value === "True" )
				val_checkbox = "checked";
			return "<input type=\"checkbox\"" + val_checkbox + "/>";
	}
}

function getDefaultValueByType( type )
{
	switch ( type ) 
	{
		case 'String':
			return "";
		case 'Int':
			return 0;
		case 'Boolean':
			return "False";
	}
}

function addRow()
{
	var a = document.getElementById("download_link");
	a.style.display = "none";
  
	var	table =	document.getElementById( 'table_id' );
	var newRow=table.insertRow(1);
	for( var i = 0; i < cnstCNT_CELL; i++ )
	{
		var newCell = newRow.insertCell(i);
		newCell.innerHTML="<input type=\"text\" value=\"\" />";
	}
	var newCell = newRow.insertCell( cnstCNT_CELL );
	newCell.innerHTML= " <select id=\"SelType\" onchange=\"onChangeSelect( this )\" ><option>String</option><option>Int</option><option>Boolean</option></select>"
	newCell = newRow.insertCell( cnstCNT_CELL+1 );
	newCell.innerHTML= " <input type=\"button\" value=\"x\" onclick=\"deleteRow(this)\">"
}

function deleteRow(r)
{
	var i=r.parentNode.parentNode.rowIndex;
	document.getElementById('table_id').deleteRow(i);
}

function onChangeSelect( select )
{
	var	table =	document.getElementById( 'table_id' );
    var allRows = table.getElementsByTagName("tr");
	var i=select.parentNode.parentNode.rowIndex;
	var cell = allRows[i].getElementsByTagName("td")[cnstCNT_CELL-1];
	cell.innerHTML = getFieldByType( select.value, getDefaultValueByType( select.value ) );
}

function getXMLType( type )
{
	switch ( type ) 
	{
		case 'number':
			return "System.Int32";
		case 'text':
			return "System.String";
		case 'checkbox':
			return "System.Boolean";
	}
}

function getXMLValueType( child )
{
	if( child.type == "on" )
		return "True";
	if( child.type == "off" )
		return "False";
	
	return child.type;
}

function getTableInXML()
{
	var	table =	document.getElementById( 'table_id' );
    var allRows = table.getElementsByTagName("tr");
	var outStr = "<?xml version=\"1.0\"?>\n";
	outStr += "<Parameters>\n";
	for( var i = 1; i < allRows.length; i++ )
	{
		outStr += "<Parameter>\n";
		var allCell = allRows[i].getElementsByTagName("td");
		outStr += "<Id>" + allCell[0].childNodes[0].value + "</Id>\n";
		outStr += "<Name>" + allCell[1].childNodes[0].value + "</Name>\n";
		outStr += "<Description>" + allCell[2].childNodes[0].value + "</Description>\n";

		console.log( allCell[3].childNodes[0].getAttribute('type') );
		var xmlType = getXMLType( allCell[3].childNodes[0].getAttribute('type') );
		outStr += "<Type>" + xmlType + "</Type>\n";
		if( xmlType == "System.Int32" && !checkNumber( allCell[3].childNodes[0] ) )
			return "";
		var xmlValue = getXMLValueType( allCell[3].childNodes[0] );
		outStr += "<Value>" + xmlValue + "</Value>\n";
		console.log( allCell[3].childNodes[0] );
		outStr += "</Parameter>";
	}
	outStr += "</Parameters>";
	return outStr;
}

function download( name, type) {
  var text = getTableInXML();
  if( text == "" )
  {
	alert( "Fix error in table" );
	return;
  }
  var a = document.getElementById("download_link");
  var file = new Blob([text], {type: type});
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.style.display = "inline";
}

function onChangeTable()
{
  var a = document.getElementById("download_link");
  a.style.display = "none";
}