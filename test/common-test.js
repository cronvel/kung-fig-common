/*
	Kung Fig common

	Copyright (c) 2015 - 2021 Cédric Ronvel

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

/* global describe, it, before, after */

"use strict" ;



const parsers = require( '..' ).parsers ;



describe( "Common parsers" , () => {
	
	var runtime = { i: 0 } ;

	it( "should parse an integer number" , () => {
		expect( parsers.parseNumber( '123' , runtime ) ).to.be( 123 ) ;
		expect( parsers.parseNumber( '-12' , runtime ) ).to.be( -12 ) ;
		expect( parsers.parseNumber( '+12' , runtime ) ).to.be( 12 ) ;
		expect( parsers.parseNumber( '0' , runtime ) ).to.be( 0 ) ;
		expect( parsers.parseNumber( '+0' , runtime ) ).to.be( 0 ) ;
		expect( parsers.parseNumber( '-0' , runtime ) ).to.be( 0 ) ;
	} ) ;

	it( "should parse a float number" , () => {
		expect( parsers.parseNumber( '123.34' , runtime ) ).to.be( 123.34 ) ;
		expect( parsers.parseNumber( '-12.34' , runtime ) ).to.be( -12.34 ) ;
		expect( parsers.parseNumber( '+12.34' , runtime ) ).to.be( 12.34 ) ;
		expect( parsers.parseNumber( '0.0' , runtime ) ).to.be( 0 ) ;
		expect( parsers.parseNumber( '+0.0' , runtime ) ).to.be( 0 ) ;
		expect( parsers.parseNumber( '-0.0' , runtime ) ).to.be( 0 ) ;
	} ) ;

	it( "should parse percent" , () => {
		expect( parsers.parseNumber( '0%' , runtime ) ).to.be( 0 ) ;
		expect( parsers.parseNumber( '100%' , runtime ) ).to.be( 1 ) ;
		expect( parsers.parseNumber( '250%' , runtime ) ).to.be( 2.5 ) ;
		expect( parsers.parseNumber( '12%' , runtime ) ).to.be( 0.12 ) ;
		expect( parsers.parseNumber( '47.5%' , runtime ) ).to.be( 0.475 ) ;
	} ) ;

	it( "should parse relative percent" , () => {
		expect( parsers.parseNumber( '+20%' , runtime ) ).to.be( 1.2 ) ;
		expect( parsers.parseNumber( '-20%' , runtime ) ).to.be( 0.8 ) ;
		expect( parsers.parseNumber( '+12.5%' , runtime ) ).to.be( 1.125 ) ;
		expect( parsers.parseNumber( '+100%' , runtime ) ).to.be( 2 ) ;
		expect( parsers.parseNumber( '-100%' , runtime ) ).to.be( 0 ) ;
		expect( parsers.parseNumber( '+125%' , runtime ) ).to.be( 2.25 ) ;
		expect( parsers.parseNumber( '+0%' , runtime ) ).to.be( 1 ) ;
		expect( parsers.parseNumber( '-0%' , runtime ) ).to.be( 1 ) ;
		expect( parsers.parseNumber( '-200%' , runtime ) ).to.be( -1 ) ;
	} ) ;
} ) ;

