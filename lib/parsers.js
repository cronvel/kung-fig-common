/*
	Kung Fig common

	Copyright (c) 2015 - 2020 Cédric Ronvel

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



const parsers = {} ;
module.exports = parsers ;



// Unquoted strings should at least contains a non-whitespace char
parsers.parseUnquotedString = function( str , runtime ) {
	var l = runtime.iEndOfLine !== undefined ? runtime.iEndOfLine : str.length ;
	var v = str.slice( runtime.i , l ).trim() || undefined ;
	runtime.i = l ;
	return v ;
} ;



parsers.parseQuotedString = function( str , runtime ) {
	var c , j = runtime.i , v = '' ,
		l = runtime.iEndOfLine !== undefined ? runtime.iEndOfLine : str.length ;

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;

		// This construct is intended: this is much faster (15%)
		if ( c === 0x22 || c === 0x5c || c <= 0x1f ) {
			if ( c === 0x22	) {
				// double quote = end of the string
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				return v ;
			}
			else if ( c === 0x5c ) {
				// backslash
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				v += parseBackSlash( str , runtime ) ;
				j = runtime.i - 1 ;
			}
			else if ( c <= 0x1f ) {
				// illegal
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + locationStr( runtime ) + ")" ) ;
			}
		}
	}

	throw new SyntaxError( "Unexpected end of line/string, expecting a double-quote (" + locationStr( runtime ) + ")" ) ;
} ;



// Skip a quoted string, without interpreting it
parsers.skipQuotedString = function( str , runtime ) {
	var c ,
		l = runtime.iEndOfLine !== undefined ? runtime.iEndOfLine : str.length ;

	for ( ; runtime.i < l ; runtime.i ++ ) {
		c = str.charCodeAt( runtime.i ) ;

		// This construct is intended: this is much faster (15%)
		if ( c === 0x22 || c === 0x5c || c <= 0x1f ) {
			if ( c === 0x22	) {
				// double quote = end of the string
				runtime.i ++ ;
				return ;
			}
			else if ( c === 0x5c ) {
				// backslash
				runtime.i ++ ;
			}
			else if ( c <= 0x1f ) {
				// illegal
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + locationStr( runtime ) + ")" ) ;
			}
		}
	}

	throw new SyntaxError( "Unexpected end of line/string, expecting a double-quote (" + locationStr( runtime ) + ")" ) ;
} ;



var parseBackSlashLookup =
( function() {
	var c = 0 , lookup = new Array( 0x80 ) ;

	for ( ; c < 0x80 ; c ++ ) {
		if ( c === 0x62 ) { // b
			lookup[ c ] = '\b' ;
		}
		else if ( c === 0x66 ) { // f
			lookup[ c ] = '\f' ;
		}
		else if ( c === 0x6e ) { // n
			lookup[ c ] = '\n' ;
		}
		else if ( c === 0x72 ) { // r
			lookup[ c ] = '\r' ;
		}
		else if ( c === 0x74 ) { // t
			lookup[ c ] = '\t' ;
		}
		else if ( c === 0x5c ) { // backslash
			lookup[ c ] = '\\' ;
		}
		else if ( c === 0x2f ) { // slash
			lookup[ c ] = '/' ;
		}
		else if ( c === 0x22 ) { // double-quote
			lookup[ c ] = '"' ;
		}
		else {
			lookup[ c ] = '' ;
		}
	}

	return lookup ;
} )() ;



function parseBackSlash( str , runtime ) {
	var v , c = str.charCodeAt( runtime.i ) ;

	if ( runtime.i >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }

	if ( c === 0x75 ) { // u
		runtime.i ++ ;
		v = parseUnicode( str , runtime ) ;
		return v ;
	}
	else if ( ( v = parseBackSlashLookup[ c ] ).length ) {
		runtime.i ++ ;
		return v ;
	}

	throw new SyntaxError( 'Unexpected token: "' + str[ runtime.i ] + '" (' + locationStr( runtime ) + ")" ) ;
}



function parseUnicode( str , runtime ) {
	if ( runtime.i + 3 >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }

	var match = str.slice( runtime.i , runtime.i + 4 ).match( /[0-9a-f]{4}/ ) ;

	if ( ! match ) { throw new SyntaxError( "Unexpected " + str.slice( runtime.i , runtime.i + 4 ) + " (" + locationStr( runtime ) + ")" ) ; }

	runtime.i += 4 ;

	// Or String.fromCodePoint() ?
	return String.fromCharCode( Number.parseInt( match[ 0 ] , 16 ) ) ;
}



var numberLineRegexp = /^(-?[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)\s*$/ ;
var numberRegexp = /^(-?[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/ ;

parsers.parseNumber = function( str , runtime ) {
	var part ;

	if ( runtime.iEndOfLine ) {
		// Line mode: the number should finish the line (KFG number value)

		part = str.slice( runtime.i , runtime.iEndOfLine ) ;

		if ( numberLineRegexp.test( part ) ) {
			runtime.i = runtime.iEndOfLine ;
			return parseFloat( part ) ;
		}

		return parsers.parseUnquotedString( str , runtime ) ;
	}

	// Normal mode

	part = str.slice( runtime.i ) ;

	// Is this needed?
	numberRegexp.lastIndex = 0 ;

	var matches = part.match( numberRegexp ) ;

	if ( matches && matches[ 1 ] ) { return parseFloat( part ) ; }

	// NaN or undefined?
	return undefined ;

} ;



// Used to report errors
function locationStr( runtime , line ) {
	var loc ;
	loc = 'line: ' + ( line !== undefined ? line : runtime.lineNumber ) ;
	if ( runtime.file ) { loc += ' -- file: ' + runtime.file ; }
	return loc ;
}

parsers.locationStr = locationStr ;

