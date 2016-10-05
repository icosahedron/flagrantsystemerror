---
title: "At Scope Exit: Generic Scoped Resource Management in C++"
date: June 30, 2015
---
# AT_SCOPE_EXIT: Generic Scoped Resource Management in C++11 #

C++ has long used scoped resource managers, where a resource (e.g., pointer or mutex) is encapsulated in an object. The object
creates or accepts the resource in the constructor and releases it in the destructor, creating a (nearly) foolproof way of making
sure that all resources are managed properly.

Perhaps the best example is the standard library [unique_ptr](http://en.cppreference.com/w/cpp/memory/unique_ptr) Given
a pointer, it will manage the pointer during the scope it is in. The following example from cppreference.com shows how it works:

```
#include <iostream>
#include <memory>

struct Foo
{
    Foo()      { std::cout << "Foo::Foo\n";  }
    ~Foo()     { std::cout << "Foo::~Foo\n"; }
    void bar() { std::cout << "Foo::bar\n";  }
};

void f(const Foo &amp;)
{
    std::cout << "f(const Foo&amp;)\n";
}

int main()
{
    std::unique_ptr<Foo> p1(new Foo);  // p1 owns Foo
    if (p1) p1->bar();

    {
        std::unique_ptr<Foo> p2(std::move(p1));  // now p2 owns Foo
        f(*p2);

        p1 = std::move(p2);  // ownership returns to p1
        std::cout << "destroying p2...\n";
    }

    if (p1) p1->bar();

    // Foo instance is destroyed when p1 goes out of scope
}
```

The nice thing is that it provides a single point of management for the pointer no matter the exit of the scope, whether by return
or exception.

What if we could do that for any resource? Have a database connection, and want to release it after exiting the function? How about
a file or a 3rd party library network connection? (Many libraries come with such scoped resource managers, but still...).

C++11 now has lambdas, making it easy to create arbitrary scoped managers. Here is an example of a small one for Windows file
handling:

```
...

hr srcFile = CreateFile2(src, GENERIC_READ, FILE_SHARE_READ, OPEN_EXISTING, NULL);
if (srcFile == INVALID_HANDLE_VALUE)
{
    // handle error
}
AT_SCOPE_EXIT({
    CloseHandle(srcFile);
});

...
```

This ensures that `srcFile` will be closed no matter how the function exits, and I didn't have to write a custom class.

`AT_SCOPE_EXIT` is defined as a class with a single `std::function<void()>` member. Then a convenience macro wraps it so that the
function body can simply be included:

```
struct at_scope_exit
{
    std::function < void() > at_exit_;

    at_scope_exit(std::function< void() > at_exit)
        : at_exit_(at_exit)
    {
    }

    ~at_scope_exit()
    {
        try {
            at_exit_();
        }
        catch(...) {}
    }
};

#define AT_SCOPE_EXIT_CAT(x,y)  x##y
#define AT_SCOPE_EXIT_ID(index) AT_SCOPE_EXIT_CAT(at_scope_exit, index)
#define AT_SCOPE_EXIT(expr) at_scope_exit AT_SCOPE_EXIT_ID(__LINE__), ([&amp;] () { expr; } );
```

I've found this immensely useful for such a small snippet. Hope you find it useful too.

Just to cover the legal side of things, *the AT_SCOPE_EXIT macro and attendant code is licensed under the WTF 1.0 license.*
