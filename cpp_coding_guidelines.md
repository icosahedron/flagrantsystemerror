title: Flagrant System Error C++ Coding Guidelines
author: Jay Kint
date: January 18, 2014

# Flagrant System Error C++ Coding Guidelines

These are my personal C++ coding guidelines, cultivated from the following sources:

* Boost Coding Guidelines published in 2001 by Dave Abrams and Nathan Myers
	* The Boost Coding Guidelines document is the basis for my coding standard. 90% of my coding guidelines are copied from here.
* [C++ Coding Standards](http://www.amazon.com/Coding-Standards-Rules-Guidelines-Practices/dp/0321113586) book by Herb Sutter and Andrei Alexandrescu
* [High Integrity C++ Coding Standard](http://www.codingstandard.com/)
* [Google C++ coding standard](https://google-styleguide.googlecode.com/svn/trunk/cppguide.xml) 

## Introduction

This document is intended to act as a set of "guideposts to uniformity". Nobody likes following arbitrary rules, and when compliance is voluntary, it's likely that nobody will (if the teachers don't, the students won't). Therefore, wherever possible, choices are made with careful attention to engineering merit and the underlying rationale is presented.

All the same, the authors of these guidelines intend that they be followed. We have learned long ago that bending the rules here or there at a whim (even with justification) tends toward code rot. Eventually your program grows such that all of your acceptable violations become unacceptable. This happens insidiously, so they never get addressed. So, if you choose to follow these guidelines, we suggest that you resist the temptation to allow yourself exceptions.

Because C++ is a markedly different language from C, good C++ code looks markedly different from good C code. Differences from good C style follow from these differences:

* Names -- particularly, qualified names, and expressions and declarations in C++ are often much longer than in C.
* Scoping in C++ is more complex than in C.
* Types in C++ are semantically far more important than in C.
* Local variable definitions in C++ are mixed in with other statements.
* C++ includes constructs that don't exist in C.
* C++ overloads syntactic elements even more heavily than C.
* Semantics of some C++ constructs differ from C.

Rules below are based on some broad principles:

* Direct expression of concepts in code is much better than annotation in comments.
* Comprehensibility for maintainers, and robustness against changes during maintenance, are at least as important as convenience for coders.
* Formatting should be deterministic and straightforward. Time spent thinking about formatting code is time better spent writing it.
* Sources of subtle bugs should be given a wide berth.
* Meaningless-busywork rules get ignored.

## 1. Files and the preprocessor

1.1. Change logs should not appear in the files.  Good comments within the version control system are where changes should be documented.  Also, use release notes (README) for software outside a vcs.

1.2. Use unique #include guards in header files. With only very rare exceptions, every C++ header file neeeds #include guards to prevent its definitions from being seen multiple times. You may use a GUID, or you can incorporate your initials and the date as shown in this example. Don't rely on these #include guards being meaningful: the date and initials are solely for sufficient uniqueness, and people use different conventions for expressing dates.

1.3. Avoid preprocessor macros (i.e. #define), especially in header files - use inline functions or function templates (for function-style macros) and enums or constants (for other macros) instead. Preprocessor symbols march across namespace and scope boundaries and can change the meaning of code in unexpected ways. Of course, #include guards are a necessary exception to this guideline.

1.4. Source file names are lower_case, because of the vagaries of filename case-sensitivity on various platforms.

1.5. Source files should #include the corresponding header file first. To be sure that each header file can be safely #included regardless of which other files have been #included first, we use this technique to help ensure that each header is #included first somewhere. Of course, this technique's effectiveness is mitigated by the extent to which (generic) code appears in header files.

1.6. All #include directives appear at the top of source files, and just after the #include guards in header files.

1.7. Avoid header file dependencies. If the header file only needs to use pointers or references to a given class, a forward declaration can be used in lieu of including the header which contains the class' definition. This practice can reduce compile times and eliminate confusing situations that arise when two definitions appear to be interdependent. Don't change your designs just for the sake of this guideline, but do apply it whenever possible. Of course, this technique's effectiveness is mitigated by the extent to which (generic) code appears in header files. Caveat: it is illegal (with good reason) for users to forward-declare names in namespace std::. We haven't yet seen a compiler which will detect violations of this rule, so be careful not to!

1.8. Use relative #include paths. Directory paths should mimic the project's namespace structure. Just as we use namespaces to prevent C++ name collisions, we use directory paths to prevent #include file name collisions.

1.9 Files intended to be processed by a C++ compiler as part of a translation unit should have a three-letter filename extension ending in "pp". Other files should not use extensions ending in "pp". This convention makes it easy to identify as C++ source.

1.10 This is the recommended directory structure for components:

|Sub-directory	|Contents	|Required	|  
| ------	| ------	| ------	|  
|``build``	|Library build files such as Jamfile.	|If any build files.	|  
|``doc``	|Documentation (HTML) files.	|If several doc files.	|  
|``example``	|Sample program files.	|If several sample files.	|  
|``src``	|Source files which must be compiled to build the library.	|If any source files	|  
|``test``	|Regression or other test programs or scripts.	|If several test files.	|  
[**Component sub-directory names**]

1.11 Begin all source files (including programs, headers, scripts, etc.) with:

* A comment line describing the contents of the file.
* Comments describing copyright and licensing: again, the preferred form is indicated in the license information page

Examples:

```
// rectangle.hpp
// Rectangle class
// Copyright (c) Jay Kint
// Licensed under MIT License

#ifndef RECTANGLE_HPP_
#define RECTANGLE_HPP_

#include <boost/operators.hpp> // operators.hpp defines names in namespace boost
#include <iosfwd>
 
class point;
class rectangle : boost::addable<rectangle>
{
   // Construct the rectangle bounded by the two given points.
   rectangle(point const&, point const&);
   ...
};
	 
#endif // RECTANGLE_HPP_

// rectangle.cpp
// Rectangle class implementation
// Copyright (c) Jay Kint

#include "rectangle.hpp"
...
```

## 2. Naming

2.1. Names, unless otherwise specified below, should be written all_lower_case with underscores separating sub-word components. Acronyms should be treated as complete words: vhdl_ams_parser. [Contrary to some popular standards, this rule applies to type names in nearly all contexts, making our naming consistent with both the standard library and boost conventions].

2.2. Names of template formal type parameters e.g., are written InMixedCase, with capitalized sub-words, e.g.

	template<class InputIterator>
	struct adaptor { typedef InputIterator base_iterator; };

Treat acronyms as ordinary words, with only the first letter capitalized (e.g. XmlObject).

2.3. Concept names in documentation (e.g. Assignable, ForwardIterator) follow the same rules as template formal type parameters (i.e. should also be written InMixedCase).

2.4. Choose complete words or phrases for names other than loop counters and iterators. A good name is better than a comment explaining what the entity does.

2.5. Avoid abbreviations and compound words: "Iterator" is better than "Iter". A short word is better than a shortened word.

2.6. Choose names to indicate purpose (e.g. known_devices) rather than implementation (e.g. device_list); the implementation is already visible in the declaration.

2.7. Boolean variables and functions should read as English predicate phrases, so that conditional statements using them read as grammatical English sentences.

2.8. Functions with side effects should be English active-verb phrases.

2.9. Avoid trademarks in names (including "Altra").

2.10. Data members should have a ``_`` suffix, to distinguish them from an otherwise-identical member function name and to clarify their provenance in code which uses them. Non-member names must not use this suffix.

2.11. Short names should respect common conventions: ``i``, ``j``, and ``k``, if used, should be loop control variables; ``p`` and ``q`` should generally be pointers or iterators.

2.12. Functions describing the state of an object should be English noun phrases (e.g. size(), not get_size()).

2.13. Preprocessor macros should be avoided. Where necessary, macros are ALL_CAPS. Avoid defining macros in header files with extreme prejudice. Any macro names which must appear in headers should be very long, or #undef'd after use.

2.14. Names containing double underscores (``__``) or beginning with single underscores (``_``) are entirely forbidden. These are reserved to the C++ implementation in various contexts.

Examples:

```
struct sector_position
{
    long track_cylinder_head;
};
	 
enum permissions
{
   read,
   write,
   read_write
};
 
axe::axe()
 : m_handle(new handle)
{
}
 
bool indicates_failure(status s);
 
void write_out_file();  // function with side effect
 
#ifndef COMPILING_UNDER_LINUX
std::size_t n = a.size();
for ( std::size_t i = 0; i < n; ++i )
{
	++a[i];
}
 
if ( buffer->was_empty() )
...
```

Discussion:

Macro names walk freely across scope boundaries, and their use even in system headers tends to anarchy.

Trademarked names cause disruptions when ownership of code or trademarks changes hands. For example, we may make a deal to sell or license our code to a partner. If we use a trademark name we might easily create work for ourselves changing names later. We might consider using "altra" as a namespace name, but should do so only after careful consideration and with group consensus.

The naming pattern "is_foo" for predicate names comes from decades of C tradition. In general, type prefixes and suffixes ("psz", "_p", "_ptr") are needed in languages and environments where object type has been lost, or to avoid colliding with type names. They make code harder to read as English and obscure the abstraction being manipulated with implementation details. They also create an undesirable link between interface and implementation, discouraging the drop-in replacement of one type for another (a very common and powerful strategy for correctly evolving and modernizing old code). Solve the problems that type labels solve by writing small functions and declaring local variables close to their point of first use.

Some names beginning with underscores are not reserved to the implementation, but these names don't add enough expressiveness to the language to be worth complicating the rules. Furthermore, in practice it is not uncommon for system headers to define these names as macros, effectively reserving them in all contexts. In order to maximize portability, such names are banned.

## 3. Expression spacing and bracketing [section3]

3.1. Binary operators are separated from their operands by whitespace.

3.2. Unary post-operators such as the function-call, array-index, and post-increment operators should not be preceded by space.

3.3. Unary pre-operators such as dereference and logical negation should not be followed by space.

3.4. The dereference operator ``->`` should neither be preceded by nor followed by whitespace.

3.5. Fully parenthesize uses of bitwise operators. Most people remember the precedence relationship between ``&`` and ``|``, but lose track when used in any other combinations. To reduce time looking in the standard and tracking down bugs, fully-parenthesize uses of ``<<``, ``>>``, and ``^`` when mixed with other operators. ``&`` and ``|`` may be mixed freely, but should be parenthesized when combined with any other operators.

3.6. return is not a function; do not put parentheses around the value being returned. This also goes for throw.

3.7  if, while, switch, for, etc. are not functions and should not have parentheses directly adjacent.

3.8  Break expressions before 80 characters.

3.9  Break expressions before an operator if possible, when they get too long. This helps mark the 2nd part of the line as a continuation.  Subsequent lines should be indented a further 4 spaces beyond the original indentation.

3.10  Parentheses and brackets should have a space between themselves and their contents, though empty function calls are not required to be separated by a space.

Examples:

```
// Right:
f( 1, 2, 3 );
operator==( char )
p[ i++ ] = q[ j++ ];
if ( this->headers()->is_empty() )
unsigned y = 0xf & (x + 1);
 
std::complex<double> total_offset = initial_offset + 3 * step_size
   + extra_steps * extra_step_size + 1.0;
 
if ( !x ) {
    return y;
}

throw std::range_error( "out of range" );

// Wrong:
operator == (char)  // no
p [i ++] = q [ j ++ ];
if (this->headers ()->is_empty ())
 
std::complex<double> total_offset = initial_offset+3*step_size+
   extra_steps*extra_step_size+1.0;
 
if (! x)
    return(y);

throw(std::range_error("out of range"));
```

Discussion:

Beginning a continuation line with an operator helps to emphasize that it is not a standalone expression.

The following arguments, cumulatively, lead to 3.2 above.

Parentheses are even more heavily overloaded in C++ than in C, and the placement of a space before some uses (e.g. in control structures and to group expressions) helps to distinguish those uses.
Spaces around binary operators help visually to identify terms in an expression, and to distinguish overloaded unary from binary operators. Lack of spaces next to unary operators helps emphasize this role.
In C++, unlike in C, "()" is explicitly an operator, and even GNU doesn't suggest a space before other unary operators (although it seems sometimes to suggest a space after some unary operators, e.g. "!", but not others, e.g. ``++``... we do not follow that rule).
In C++, unlike in C, the argument list of a function is part of its name, just as the tilde is part of the destructor's name.
Spaces inserted in expressions involving two or more applications of the function-call operator()(), as in

    return this->guarantor ()->lookup (name)->as_string ().c_str ();
           +-------------+ +--------+ +---------------+ +------+ +-+ 

lead to odd groupings.
Every C++ textbook -- I have 10 here, not counting C books -- places a unary operator, including function-call, directly adjacent to its argument. Only GNU departs from this industry-wide standard, for reasons that appear to refer rather to LISP than C conventions.

## 4. Spacing of definitions and declarations

4.1. Definitions at primary namespace or global scope begin at the left margin. Opening the primary named namespace in a file does not induce an extra level of indentation. Secondary nested namespaces (e.g. ``...::detail``) are on separate lines also at the left margin.

4.2. Separate lines at identical indentation are devoted to:

* any ``template<...>`` clause
* the name of a class or function being defined
* the opening and closing braces of a function, statement, or class body

4.3. The return type and storage class of a function go on the same line as the name.

4.4. A blank line is required between consecutive multi-line definitions.

4.5. Definitions in class bodies are indented four spaces from the enclosing brackets. Second and subsequent lines of member definitions in class bodies are further indented.

4.6. Arguments to function definitions are on separate lines and indented two to four spaces (not out to the open-parenthesis). Other breaks may be indented to line up with other expression elements.

4.7. Multiline declarations should be separated from other code by blank lines.

4.8. Access specifiers (public, private, and protected) may be either at the margin of the class or indented one space from the opening brace of a class declaration.

4.9. Omit spaces in template instantiations. Spaces are allowed between arguments to template declarations. Unnecessary spaces in type names weaken their recognizability as a syntactic unit. Instantiations with names that are too unwieldy in this form should be typedef'ed.[^1]

[^1]: The jury is still out on this rule.  Perhaps spaces should be allowed between brackets and parameters.

Examples:

In a ".hpp" file

	namespace altra { 
	namespace device_db {

	namespace detail {
	    typedef unsigned long terminal_index;
	};

	class catalog
	{
	 public:
	    explicit catalog();

	    template<class T>
	    void f(T);

	    template<typename T>
	    void template_function(T* target,
	        std::basic_string<T> const& source);

	    int roll_back_transaction();
	};
	 
	template<typename Iterator, size_t N>   // spaces inserted
	class Range
	{
	...
	 
	}} // namespace altra::device_db

In a ".cpp" file:

	namespace altra { 
	namespace device_db {

	catalog::catalog()
	{
	   std::pair<Runtime::Name, Runtime::Value> tagged_result;  // no spaces
	}
	 
	template<typename T>
	void database::template_function(
	    T* target,
	    std::basic_string<T> const& source)
	{
	    target->instantiate_element(
	        source.const_begin(), source.const_end());
	}
	 
	namespace {

	int f(
		int const x)
	{
	  return x+1;
	}

	} // unnamed namespace
	 
	int 
	database::roll_back_transaction()
	{ ... }

## 5. Block and statement formatting

5.1. Use a separate line for opening and closing braces. If you find that your functions are taking up too much space, break them into smaller pieces. Empty blocks may begin and end with brackets on the same line.

5.2. Braces should have the same indentation as the previous line. The GNU indentation style, where braces are indented more than the previous line, but less than the code they contain, introduces visual clutter that harms readability.

5.3. Statements within a block are indented four spaces.

5.4. Use spaces, not tabs, for indentation. If everyone always used tabs, it would probably be OK, but since they don't we end up with files full of mixed spaces and tabs. Variable tab width causes alignment problems, so they are banned from source code.

5.5. Use a separate line for dependent clauses of control structures like if, for, and while statements. 

5.6. All dependent clauses must be blocks, even if they are simple statements. This helps to clarify structure and helps readability by separating the code into digestible pieces. More importantly it aids debugging by allowing breakpoints to be set on the dependent clause.

5.7. If the ``if`` clause is a block, the matching ``else`` clause must also be a block, and vice-versa. Balance between the clauses helps the eye to pick out their association.

5.8. Second and subsequent lines of a statement are indented at the same level as first level indentation (four space usually). The function-call operator ``()`` does not introduce a subexpression, so should not be grouped and indented like parentheses that do. Terms within an expression should be indented according to expression structure as in [section 3](#section3).

Examples:

	inline void 
	action::set_timeout_time( void )
	{
	   this->timeo_time = Boottime::now().add_seconds(
	       this->timeo == 0 ? 10000000 : this->timeo);
	}

	void f( void )
	{ 
	    if ( x < 0 )  
	    {						// brace required despite only a single statement
	        do_something();    // a breakpoint can be set here
	    }

	    while ( x > 0 ) 
	    {                       
	        if ( checklist[x] ) 
	        {				    
	            ++total;        
	        }
	    }

	    if ( x < 0 )
	    {                    // these braces are required
	        x = 0;           // because the else clause
	    }                    // needs braces.
	    else
	    {
	        for ( y = 0; y < x; ++y )
	        {
	            do_something();
	        }

	    	do_some_other_thing();
	    }
	}

## 6. Declarations and initialization

6.1. Only one name may be declared in a definition statement.

6.2. Place * and & with the type name, not the object name. This guideline and the previous one are corrolaries: we eschew the compact but unclear style inherited from C which makes it neccessary to bind type qualifiers to the name they are qualifying.

6.3. Initialize local variables whenever a meaningful value is available. This prevents uninitialized variables from being used, and is enables the following guideline to be fully realized.

6.4. Define local variables as late as possible, when they can be meaningfully initialized and used immediately. Doing otherwise forces the reader more to consider variables not yet relevant to code at hand, and often costs efficiency since we pay for both construction and initialization.

6.5. Do not re-use a variable for different purposes. Re-using local variables does not save on resources; the compiler knows when a variable is no longer used. Re-using a variable can confuse readers, and sometimes also inhibits optimization by the compiler. Reusing variable names, e.g. loop control variables which are limited to different scopes, is OK.

6.6. Use const wherever possible. Code is clearer when values do not change. Declaring a variable const allows a programmer to brace herself against the compiler to check that her intention is fulfilled. This guideline works synergistically with the previous one, and is particularly powerful when used on parameters in function definitions. Declaring a value-parameter const has no effect in a function declaration and is meaningless to the caller, so leave const off here -- use it at the point of function definition instead.

6.7. Place const after the base type it modifies. This simple rule makes it easier to write type declarations correctly and will make your declarations consistent with compiler-generated type descriptions in error messages.

Examples:

	char* p = "flop";
	char& c = *p;
	char const* extract( std::pair< char*, int >& p );

	  -not-

	char *p = "flop", &c = *p;
	char const *extract( std::pair<char*,int>&p );
	void f()
	{
	    ...
	    std::size_t n = g();  // delayed declaration
	    std::vector<int> counters( n );
	    list<int> shadow_masks( x.begin(), x.end() );
	    ...

   -not-

	void f()
	{
	    int n;
	    list<int> shadow_masks;
	    ...
	    n = g();  // delayed initialization
	    std::vector<int> counters(n);
	    shadow_masks.insert(x.begin(), x.end());
	int const score_from_step_1 = step_1_score();
	int const score_from_step_2 = step_2_score();
	int const best_score = std::max( score_from_step_1, score_from_step_2 );
 
  -not-

	int best_score = step_1_score(); // not really best, neccessarily
	int score2 = step_2_score();
	if (best_score < score2)         // now we know what's best
	    best_score = score2;

	int const max_header_lines = 120;   // constant integer
	char* const buffer = &s[0];         // constant pointer to mutable char
	char const* log(const char* s);     // mutable pointer to constant char
	std::string const& lookup();        // reference to constant string
	double f(double x, double y);   // declaration
	   ...
	double f( double const x, double const y )   // definition
	{
	    // x and y don't change in the function body, so
	    // we know the original values are always accessible
	}

Discussion:

## 7. Comments and documentation

7.1. Use ``//`` to delimit comments in lieu of ``/*...*/``

7.2. Long comments begin on a separate line from active code, and refer to the code below them. Comments of more than one line are separated from other code by a blank line above.

7.3. All function interfaces must be commented (except for copy constructors, operator overloads such as copy-assignment and dereference, and destructors). The comment describes precisely what the function requires, what its effects are (especially including side-effects), and gives notice if the function provides anything other than the strong exception-safety guarantee. Accuracy is more important than brevity*.

7.4. Comment function interfaces in just one place. It can be difficult enough just to keep comments synchronized with code. Just as not duplicating code reduces the risk that some code will grow stale, commenting a function in one place only reduces the risk of comments not being maintained together. Whether a function interface comment must appear at the point of declaration or of definition is covered below.

7.5. Comment the declarations of all public and protected member functions other than copy constructors, copy-assignment operators, and destructors when they have well-understood idiomatic meanings.

7.6. Comment every virtual function only at its least-derived point of declaration. This applies even if the function is private. The comment describes how and when it is called, why you would want to override it, and, for non-pure functions, the effects of the default implementation.

7.7. Declarations of free functions that are part of a public interface should be commented.

7.8. All other functions (private non-virtual functions, functions in unnamed namespaces) should be commented where they are implemented. In general, try to keep the description of implementation details out of header files.

7.9. Strive for brevity inside of class declarations. Commenting member functions well is difficult. Try to avoid obscuring the structure and interface of the class with long comments. Sometimes this means you spend more time editing the comment than writing the function*.

7.10. Comments within code should answer the question "why", not "what". Good comments do not replicate information already clearly visible in code, but call attention to subtleties and fragilities. Obvious code is harmed by commenting, but be aware that what is obvious to the writer is often obscure to the reader. A large comment block organized as paragraphs is more useful than cryptic one-line comments distributed through code, and less distracting.

7.11. Use correct English sentences, with proper spelling, capitalization and punctuation.

7.12. Use standard C++ terminology when writing about C++ code. Write member function or virtual function instead of method. Write class template instead of template class and data member instead of attribute or instance variable.

7.13. Write names as they appear in code. Function, variable and type names are lower-case even at the beginning of a sentence. Names of Concepts are capitalized, wherever they appear. Function names have ``()'' appended.

7.14. Class invariants that are visible through public or protected interfaces should be documented before the class declaration. Invariants specific to the implementation should be documented before most of the class implementation.

7.15. Comment out code using ``#if 0...#endif``, or ``//``, not ``/*...*/`` comment notation. Avoid checking in code that's been commented out. Since it doesn't get tested, it will likely not make any sense tomorrow even if it makes some sense today.

Discussion:

The problem with ``/*...*/`` is that it doesn't nest properly. People sometimes try to comment out a long section by enclosing it in ``/*...*/``, but if it already contains ``/*...*/`` somewhere, then the first ``*/`` ends the comment. It is often suggested that ``/*...*/`` should be allowed for text comments, but you can embed code examples in text, which causes the same nesting problem.

A short ``()`` makes the difference between having to say ``calls the insert function`` and ``calls insert()``.

Short comments on class member functions help to document a class' interface without obscuring its overall structure.

A virtual function and its overriders share a common interface, and are meant to be able to be used in a common way through a pointer or reference to the base class in which it is first declared. Thus, commentary about how to use this interface goes with the first (least-derived) declaration.

## 8. Class organization

8.1. Names defined in classes appear in the following order:

* Public type forward-declarations & typedefs
* Public constructors & destructor
* Public member functions
* Protected type forward-declarations & typedefs
* Protected member functions
* Private type forward-declarations
* Private member functions
* Private data members

Class definitions are read most frequently by users, who are most interested in public members, particularly constructors. Data members are of interest only to maintainers, so they appear last.

8.2. Make all data members private. Public data members are allowed only in C-like structs, where the only member functions permitted are constructors. Protected data members are forbidden.

8.3. Friend access should only proceed through member functions. When special member functions are provided only for the use of a friend, they should be private, declared close to the friend declaration.

8.4. Function definitions in the class body are forbidden, except for empty virtual functions (which serve to document the default behavior for hook functions) and the bodies of operator() in simple function objects. Virtual destructor bodies should usually not be inlined, so use caution when defining these inline.

8.5. Nested-class definitions should be defined outside the nesting class body, wherever possible. If the nested class is an implementation detail, move its definition into the appropriate source file.

8.6. Re-use the keywords ``public'``, ``private``, and ``protected`` liberally to separate groups of member types, member functions, and data members.

8.7. Do not repeat the ``virtual`` keyword where derived classes declare overrides for base class virtual functions. Instead, group and label virtual function overrides as shown in this example.

8.8. Do not write the ``inline`` keyword on member function declarations. It is sufficient to use ``inline`` on the function definition.

Example:

	class outer
	{
	 public:
	    // ...
	 private:
	    struct compare; // nested class declaration
	    int m_count;
	};
	 
	// nested class definition outside enclosing class

	// a simple function object may define operator() in the class.
	struct outer::compare
	{
	    bool operator()(outer const& x, outer const& y) const
	    {
	        x.m_count < y.m_count;
	    }
	};
	// foo.hpp
	class foo : public abstract_base1, public base2
	{
	 public:
	    // base_name specifies the common prefix for results of
	    // create_unique_name() below.
	    foo(std::string const& base_name);

	    foo(foo const&); no comments are needed for standard functions
	    foo& operator=(foo const&);
	    ~foo();

	    // Used to apply foo to a collection using std::for_each()
	    void operator()(int) const;

	 public: // interface which subclasses must implement
	    // Creates a copy of the concrete instance on the heap.
	    virtual std::auto_ptr<foo> clone() const = 0;

	 protected: // types
	    typedef std::list<std::string> name_history;
	 
	 protected: // helper functions
	    // Creates a new name for use as blah. A different name is created
	    // each time this function is called.
	    std::string create_unique_name() const;

	    // Returns the last 1000 names retuned by create_unique_name()
	    name_history const& history() const;

	 private: // hook functions
	    // override bar_hook() to do blah, blah. It is called when blah, blah
	    virtual void bar_hook() {}

	    // override froom to do blah, blah. It is called when blah, blah.
	    // The default implementation does blah.
	    virtual void froom();

	    // Schnix is expected to blah and is called when blah.
	    virtual void schnix() = 0;

	 private: // abstract_base1 required implementation
	    void base1_f1();         interface comments for these live in abstract_base1
	    void base1_f2();
	    int base1_f3();
	 
	 private: // base2 overrides
	    void base2_f1();         interface comments for these live in base2
	    void base2_f2();

	 private: // helper functions
	    int invocations() const; comments for these live with their implementations
	    void g(int);           
	 
	 private: // data members
	    long m_broom_count;
	    // used only for debugging, thus not part of foo's logical const-ness.
	    mutable int m_invocations;
	};
	 
	//
	// inlines
	//
	 
	// Return the number of times the function call operator
	// has been invoked on this object.
	inline int foo::invocations() const
	{
	    return m_invocations;
	}
	// bar.hpp
	...
	class foobar : public foo, public foobaz
	{
	 public: // constructors, other public interface, etc.
	    ...
	 
	 public: // interface required by base class foo
	    std::auto_ptr<foo> clone() const;  no comment here -- that's in foo.hpp
	    void baz();
	 
	 private: // foo virtual function implementations
	    void bar_hook();                   no comment here -- that's in foo.hpp
	    void schnix();
	 
	 private: // helper functions
	    ...
	 private: // data members
	    ...
	};

Discussion:

Reading cluttered class bodies is hard enough without big function and nested-class definitions mixed in. Substantial blocks of "other" material can and should be forward-declared in the class body, and defined separately whenever possible. If your class' public and protected interface is still hard to take in at a glance, consider refactoring it into smaller parts.

Writing ``virtual`` on the declaration of a virtual function override is neither neccessary nor sufficient to document where it comes from and which code it interacts with. Leaving the keyword off in derived classes reduces clutter and thwarts the temptation to treat it as sufficient documentation.

Inlines are the third most-misused C++ feature (after inheritance and overloading), used far more often than any practical criterion could justify, just because it is more covenient to write them in place. Anything that encourages their use beyond strict engineering merit is detrimental.

Writing ``inline`` on the declaration of a member function documents an implementation detail in an inappropriate place. A class declaration should clearly document interface. Implementation details should be documented where they are implemented.

Function objects are often just wrappers over a simple function or function template. Separating interface from implementation in that case often makes things harder to read.

## 9. Inheritance and run-time polymorphism

9.1. Avoid inheritance in your public interface, unless you really mean it. Public inheritance establishes an is-a relationship, where the derived class can always be converted to, or used in place of, the base class. Use containment or delegation rather than private inheritance to establish an is-implemented-in-terms-of relationship.

9.2. Base classes should be abstract. You should avoid creating concrete non-leaf classes for two reasons: first, the implicit is-a relationship is usually not desired, and tends to miscommunicate your intent. Second, instances of the derived class can be converted to actual instances of concrete base classes, which can result in undesirable ``slicing''. A concrete base can be factored into an abstract interface and a concrete non-base class, which helps to document commonality. If you must write concrete base classes, the slicing can be prevented by making them noncopyable.

9.3. Override a virtual function at most once in any path up the inheritance hierarchy. No derived class should implement a virtual function that is also implemented in one of its ancestors, except in the class where that function is first declared. This helps to clarify designs by keeping the model simple: the function to be called is either the default implementation, or it is the (single) overrider.

9.4. Implementors of derived classes are clients of the base class. Anticipate the needs of derived class implementors (even if they're you). Provide a non-empty, non-pure virtual function only when you expect a subclass to completely replace the function's implementation. Do not force derived class implementors to understand whether to do their work before, after, around, or instead of the base class implementation. Instead, provide hook functions with empty implementations for subclasses to add behavior.

9.5. Avoid calling a base class' version of a virtual function explicitly, especially from the derived class' override. The need to do this is usually an indication of careless design in the base class. Instead, refactor the base class implementation as detailed above.

9.6. Non-pure virtual functions should be private. If necessary, provide a separate public or protected interface which calls the virtual function. This allows the base class implementation to add extra pre- or post-processing steps without worrying about the derived class implementations. Pure virtual functions do double-duty as a way of requiring a particular interface in derived classes, so they may be public.

9.7. Make virtual functions pure virtual in a base class unless a default behavior is desired.

Discussion:

Every class provides two interfaces to the outside world. The public interface is obvious, but the interface for derived classes includes all protected members (accessiblity) and all virtual functions, regardless of access privilege (replacement of functionality). Making virtual functions private wherever possible helps to keep down the already substantial amount of thinking needed to verify correctness, by ensuring the context of a call of a particular base implementation. One never needs to ask ``what assumptions are being made about the program's state which might be violated in a derived class?'', because the base class implementation is only called from one place.

Experience has shown that use of protected data leads to severe maintenance problems, as implementations at different levels of a class hierarchy make different assumptions about how protected data may be used.

Inheritance is the single most overused language feature. It is over-promoted in textbooks by equating its use with "object-oriented" programming, and that with "good" programming. Object-oriented programming is one style among many supported by C++.

Occasional use of public inheritance as a private implementation detail of a class is OK when it can be used to avoid writing lots of forwarding functions. In this case, however, the complete public interface of the derived class must be described somewhere in documentation, even though part of it is supplied by a base class.

## 10. Component documentation

10.1. Precede each component with a comment block describing its interface. A component is a class or small set of closely related classes and functions, usually in a single header file.

10.2. Component interface comments should say what the component is for and how it should be used. If the component supports specialized idioms (e.g. the way std::auto_ptr suppports transfer of ownership), this is the place to give examples. If the component being documented is unremarkable, brevity is fine.

10.3. Document the interface for derived class implementors separately from the public interface. Use a separate section in the comment block, if extra commentary is needed . The latter defines what is required of derived classes that implement the interface, and what the base class definition does (if anything).

10.4. Template documentation must list the specific operations applied by the template to actual-argument types, as do the Concepts (e.g. forward iterator, assignable) described by the C++ standard. Documentation may simply refer to an already named Concept, either in the standard or elsewhere. It is a grave error for a template to exploit an operation not listed, because the compiler may not report the misuse.

10.5. Implementation notes appear separately from public interface and derivation interface documentation, preferably not in the header file. These include a concise and complete list of class invariants, preferably in a form that can be verified by assertions. A class invariant is a condition guaranteed on entry to any public or protected member function, and restored before returning to callers of those functions.

Examples:

	// Invariants:
	//   1. this->container is either 0 or points to a valid container
	//   2. if ( this->container != 0 ) this->container->size() > 0.

## 11. Error handling and robustness

11.1. Be conscious of and maintain your class invariants. Be sure that if an error occurs your objects are in a "valid state". For example, a class containing two arrays which are always supposed to be the same length must maintain that condition even if it runs out of memory when trying to grow one of the arrays. Sometimes this involves a rollback action.

11.2. Encapsulate the ownership of every resource with an appropriate resource-owning object. This is essential to exception-safety and helps clarify code by reducing the number of try/catch blocks. Existing classes provided by the standard (std::unique_ptr) and the boost library cover most of what you might want already.

11.3. Document transfer-of-ownership. Using std::unique_ptr is the best way; it simplifies function naming and enforces correctness in code. When std::unique_ptr is inappropriate, name prefixes like create_ and adopt_ can help.

11.4. Use assert() (or a suitable alternative) liberally to detect unsatisfied preconditions and programming errors. A precondition is a condition which must be true before a function can be called. Each time you write a function, ask yourself ``what am I assuming about the parameters to this function?'', and assert() each of your assumptions. For example, if you've implemented an array class with a function get_nth(int index), you'll want to assert that index is non-negative and less than the length of the array. In these cases it may also sometimes be appropriate to throw an exception.

11.5. Use exceptions to report error conditions which can't be reasonably or efficiently checked by the caller. Usually these are resource allocation failures such as out-of-memory or file-unavailable conditions.

11.6. When a function throws an exception it should have no effects, if possible. In other words, the program state should be returned to a condition indistinguishable from what it was before the function was called. This is known as the strong guarantee. Functions giving the strong guarantee do not need to be specially commented to take note of that fact.

11.7. Any functions which do not give the strong guarantee must still give the basic guarantee that invariants are preserved and no resources are leaked. Functions giving the basic guarantee should be prominently commented to take note of that fact. The words ``basic guarantee only'' are sufficient.

11.8. Provide the no-throw (failsafe) guarantee on functions used for recovery. Try to anticipate which functionality might be needed for rollback of complex operations, and provide an additional, documented guarantee that no exceptions will be thrown.

11.9. Make exceptions descendants of std::exception. This simplifies error reporting by providing a common interface through which information about the error can be retrieved. It is fine to extend the interface of std::exception in your derived class if additional info, such as OS error codes, is available.

11.10. Do not throw types whose copy constructor may throw an exception. A thrown object is immediately copied into a special memory area by the implementation. If an exception is thrown at that point, terminate() will be called. That's probably not what you meant! Resist the tempation to include a std::string member in your exception object, since its copy constructor may throw! A statically-sized array of characters or a boost::shared_ptr<std::string> may be used instead. Note that constructing a type with a throwing constructor at the point of error detection may cause the error to be mis-reported.

11.11. Do not allow exceptions to escape from destructors. This results in immediate termination if the exception is thrown during stack unwinding.

11.12. Beware std::uncaught_exception(). It doesn't tell you whether exception recovery is in process, so you can't use it to determine if throwing an exception is actually safe.

11.13. Do not use exception specifications, e.g. void f() throw(std::exception). Exception specifications provide no compile-time safety, and instead terminate your program at runtime when violated. If you wish to document what a function can throw, use a comment instead. You may use empty exception-specifications (i.e. throw()) on functions which do not throw exceptions; some compilers will make optimizations based on this information. In this case the exception-specification should be generated by a standard macro (e.g. ALTRA_NO_THROW) which can be made empty for compilers which ``pessimize'' code with exception-specifications.

11.14. Understand the real consequences of new(nothrow). While it guarantees that no exception will occur due to memory allocation, the constructor may still yield an exception. In general, you can't use this construct to suppress exceptions in dynamic allocation.

11.15. Do not expect throwing an exception to be efficient. It is inappropriate to use exceptions to report errors which will happen very often in efficiency-critical sections of code. Searching a string for a character by throwing an exception each time the character is not found is an extreme example.

11.16. Step through each line of code you write or change in a debugger. This includes error-handling code. It is OK to artificially stimulate error conditions for debugging purposes. See ``Writing Solid Code.''

Discussion:

Invariants provide maximally concise documentation of the usage pattern of data members in the various member functions, so that not all members need be studied in detail before modifying one of them.

Use of explicit Class Invariants is among the most powerful tools known for improving C++ code quality. Assertions which express invariants make testing much more likely to detect errors. Difficulty expressing concise invariants may indicate design problems, so minimizing one's list of invariants is part of design optimization. The earlier invariants are codified, the more useful they are.

Invariants are important for exception safety, as they provide a checklist of conditions which must be restored to enable safe re-entry after an exception.

Throwing an exception when you can't meet a postcondition (fulfill a request) is actually a service to your client -- the alternative is usually the imposition of additional preconditions on client code.

std::uncaught_exception returns false inside of catch blocks, so if a function tries to use this to determine if an exception should be thrown, and this function is called from a catch block, the original exception caught will be discarded and replaced by the new one. Later actions in the catch block will be skipped.

A few compilers can optimize exception tables away when a cascade of function calls have nondecreasingly strict exception-specifications. With these compilers, it might be a good bet to use empty exception-specifications on functions that don't throw, like destructors -- these are easy enough to keep track of. Of course, use of this optimization is highly non-portable, and will often have the opposite effect on other compilers, since they must generate an implicit try/catch block to implement the run-time termination behavior when an exception specification is violated.

## 12. Namespaces

12.1. Put all your code in a namespace. This helps prevent collisions with our own code and with 3rd-party libraries. It also gives us the flexibility to re-use simple, logical names in different contexts.

12.2. Each module should be in a separate sub-namespace. To reduce qualification across modules, names can be imported into the project namespace with using-declarations*. When names live in separate namespaces, ambiguity can always be resolved with explicit qualification. When they don't, you've violated the language's one-definition-rule.

12.3. Prefer explicit qualification when referencing a name in another namespace (particularly std::). Explicit qualification clearly indicates what you're referring to.

12.4. Avoid using-directives (e.g. using namespace std;). A using-directive brings all of the names from a namespace into another namespace (or the global namespace). This can easily cause unexpected effects and ambiguities, especially when the organization of header files changes. Finally, template name lookup doesn't proceed through using-directives the way you might expect it to. Just say no.

12.5. Avoid the standard 'C' headers. The standard 'C' headers (e.g. <stdio.h>) put names into the global namespace. In fact on some implementations, they add a using-directive which imports all names from std into the global namespace. Every standard 'C' header has a C++ counterpart which puts its names into namespace std. Simply remove the '.h' suffix and add a 'c' prefix. So <stdio.h> becomes <cstdio> and <stdlib.h> becomes <cstdlib>. Of course, since assert() is a macro, when you #include <cassert>, it still doesn't take any std:: qualification.

12.6. Use the unnamed namespace to define names local to a translation unit. Sometimes it is useful to define names (especially type names) in a source file, with the expectation that they won't collide with definitions in other source files. An unnamed namespace may be opened within any other namespace (including the global one).

12.7 Put implementation details into sub-namespaces (e.g., boost::detail).

12.8 Use anonymous namespaces instead of private functions as much as possible.

Examples:

	namespace {

	struct my_predicate
	{
		bool operator()( char ) const;
	};

	}

	std::pair<std::string,value*> mapping;

	std::copy( s.data(),
	   std::find_if( s.data(), s.data() + s.size(), compare_char() ),
	   buffer );

## 13. Overloading

13.1. Overloaded functions should express the same semantics, or variants thereof.

13.2. Operator overloading should reflect recognizable idioms. The use of ``+'' should indicate a form of addition, etc. It is rare that operators can be effectively used to express a new idiom, the way << for streaming was introduced (some legitimately dispute that usage).

13.3. Default argument values should not run a constructor. Overload instead. Visible action is better than invisible action. Default arguments that "do work" invisibly make it harder to understand the function and its cost, and make debugging harder. Default argument evaluation is usually done at the call site, increasing code size.

13.4. Avoid overloading virtual functions. Because virtual functions are an implementation method, rather than an interface technique, overloading is usually not appropriate for virtuals.

13.5. Use overloading for const-correctness. When a function returns a non-const reference or iterator into one of its arguments (or *this), there should usually be a companion function returning the corresponding const reference or iterator.

Examples:

	// Free functions
	char* next_word( char* s );
	char* const next_word( char* const s );
	 
	// in a class
	iterator begin();
	const_iterator begin() const;
	 
	bool is_locked() const;  // OK
	void is_locked( bool );  // Evil
	void set_lock( bool);  // OK
	 
	// wrong:
	void format_disk(std::string const& volume_name = "");
	 
	// right:
	void format_disk( std::string const& volume_name );
	void format_disk();

## 14. Type conversions

14.1. Eschew implicit conversions. Avoid constructs that implicitly convert one type to another.

14.2. Use the explicit keyword on constructors (other than copy-constructors) that can be called with one argument. Remember that this includes constructors where all arguments, or all but one argument are defaulted.

14.3. Do not define conversion operators, particularly to numeric types. Defining operator bool() is always a mistake. Write explicit conversion functions instead.

14.4. Avoid type casts with extreme prejudice! Every cast in the language allows you to do something you shouldn't. Even if you get the code right today, casts allow changes introduced during maintenance to cover bugs. Changing something and letting the compiler tell you what needs to be adjusted is a very powerful maintenance technique. Too many casts reduce this strategy to a shot in the dark.

14.5. Isolate type casts where required. If you must use a cast, it is better to isolate it in a wrapper than to proliferate it. For example, a library might implement vector<T*> in terms of vector<void*> to prevent code bloat, rather than have its users cast pointers to/from void* and use a vector<void*> directly.

14.6. Know which casts are safer. dynamic_cast<>, where applicable, is safer than static_cast<>. static_cast<> and const_cast<> and reinterpret_cast<> are generally safer than `C'-style casts.

Examples:

	struct grunt
	{
	    explicit grunt(int); // prevent implicit conversion from int
	    explicit grunt(char const* = 0, int = 1);  // or char const*
	    grunt(grunt const&); // copy constructor not explicit
	};

	class my_string
	{
	 public:
	    char* const c_string() const; // right
	    operator char const*() const; // wrong

Discussion:

Visible action is better than invisible action.

Implicit conversions are far more frequently a cause of invisible bugs and troublesome ambiguities than they are a convenience for users. Besides providing invisible conversion paths creating usually-unwanted temporaries, conversions may make it harder to call the correct one of a set of overloaded functions.

One place where experience has shown implicit conversions to be advantageous is in interfacing with older code. Implicit conversion can allow a safer type to act as a drop-in replacement for another which fills the same role. This should only be used as a transitional technique, if at all. A correct long-term strategy would be to write a wrapper for the old interface which uses the safer type in place of the other.

Because template function argument type deduction cannot take advantage of conversions, otherwise-useful conversions often are not usable in code that uses templates. In such a context explicit casts are often the alternative.

Explicit casts introduce risk because it is easy to use the wrong cast accidentally, and the compiler won't help. Explicit conversion functions don't suffer these problems.

A conversion to operator bool() is also a conversion to int, char, and double, since bool participates in promotion. If a type absolutely must be used in a conditional context (this is rare; generally, such a type should have no other purpose) it should instead convert to void const*, which doesn't implicitly promote to other types.

## 15. Miscellaneous

15.1. Use the standard library. If functionality is provided in the C++ standard library, use that instead of reinventing it yourself or using some other library.

15.2. Don't use functions which accept variable numbers of arguments (e.g. the printf() family of functions). These functions are not typesafe at compile-time or at runtime, and even if you get them right are not resilient to changing types during program maintenance. Better alternatives are families of overloaded functions and operator overloading (e.g. operator&lt;&lt;()).

15.3. Avoid std::endl unless you really mean it. std::endl is exactly like "\n" except that it flushes the output buffer. This results in bigger code because it becomes a separate function call, slower code because it subverts buffering. You might want to use it when generating debug output, to be sure that output is flushed before a hypothetical crash, but simply embedding "\n" in an output string usually works better. Note that std::cerr is unbuffered by default.

15.4. Derive classes from boost::noncopyable if you don't want to think about copy-by-value semantics. The compiler will generate semantics for you if you don't do anything explicit, so either consider the results or disallow copying.

15.5. Beware reference data members. A reference used as a data member prevents the default assignment semantics from taking effect and usually prevents any useful user-defined assignment operator, since a reference can't be ``reseated''. Consider using a pointer instead.

Last Revised 1-9-2014
