/*
	Kung Fig common stringifiers

	Copyright (c) 2015 - 2018 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var stringifiers = {} ;
module.exports = stringifiers ;



var stringReplaceRegex_ = /[\x00-\x1f\x7f"\\]/g ;



stringifiers.stringifyQuotedString = str => '"' + stringifiers.escapeString( str ) + '"' ;
stringifiers.escapeString = str => str.replace( stringReplaceRegex_ , stringReplaceCallback ) ;



function stringReplaceCallback( match ) {
	return stringLookup_[ match.charCodeAt( 0 ) ] ;
}



var stringLookup_ =
( function createStringifyStringLookup() {
	var c = 0 , lookup = new Array( 0x80 ) ;

	for ( ; c < 0x80 ; c ++ ) {
		if ( c === 0x09 ) {
			// tab
			lookup[ c ] = '\\t' ;
		}
		else if ( c === 0x0a ) {
			// new line
			lookup[ c ] = '\\n' ;
		}
		else if ( c === 0x0d ) {
			// carriage return
			lookup[ c ] = '\\r' ;
		}
		else if ( c <= 0x0f ) {
			// control chars
			lookup[ c ] = '\\u000' + c.toString( 16 ) ;
		}
		else if ( c <= 0x1f ) {
			// control chars
			lookup[ c ] = '\\u00' + c.toString( 16 ) ;
		}
		else if ( c === 0x5c ) {
			// backslash
			lookup[ c ] = '\\\\' ;
		}
		else if ( c === 0x22 ) {
			// double-quote
			lookup[ c ] = '\\"' ;
		}
		else if ( c === 0x7f ) {
			// backslash
			lookup[ c ] = '\\u007f' ;
		}
		else {
			lookup[ c ] = String.fromCharCode( c ) ;
		}
	}

	return lookup ;
} )() ;

