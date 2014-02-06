# Using Static Members on Dynamic Types in C\#

The [``dynamic``](http://msdn.microsoft.com/en-us/library/dd264736.aspx) type in C# introduces the ability to defer type checking on property usage and method calls.  It is a very useful for performing late binding with objects loaded from assemblies at run-time (e.g., plug-in assemblies).

It does have one flaw though.  You cannot use static members on dynamic types by default.  Instead, a little glue code is needed to tie it together.

Here we have an assembly of static members:

```
// Assembly with static members

namespace StaticMembers
{
    class StaticMembersOnly
    {
        public static string Property { get; set; }
    
        public static void Method()
        {
            Console.WriteLine( Property );
        }
    }
}
```

We compile this into an assembly, aptly named ``StaticMembers``. 

We then want to load the ``StaticMembersOnly`` class from the assembly, bind it to a variable, and then make calls to its static methods and properties, just as if it were a normal class object.

```
Assembly StaticMembers;
dynamic StaticMembersOnly;

// magic goes here
 ...

if( StaticMembersOnly )
{
    StaticMembersOnly.Property = "Property was here.";
    StaticMembersOnly.Method();    // Outputs "Property goes here." to console.
}
```

Ah, but what is the magic?  Well, let's pull back the curtain!

The first part of course is fairly pedestrian (well, it's all more or less pedestrian).  We load the assembly using the standard APIs, then retrieve the type from the assembly we wish to use:

```
try
{
    StaticMembers = Assembly.Load("StaticMembers");
}
catch( Exception e )
{
    dynamic ex = e;
    string message = "Failed to load " + ex.FileName + " assembly";
    throw new ApplicationException(message, e);
}

Type TypeStaticMembersOnly = StaticMembers.GetType("StaticMembers.StaticMembersOnly");
```

Next, we wish to put the ``StaticMembersOnly`` class into the ``StaticMembersOnly`` dynamic variable for use as a normal class.

```
StaticMembersOnly = new StaticMembersDynamicWrapper(TypeStaticMembersOnly);
```

What is the ``StaticMemberDynamicWrapper`` class?  It uses the Dynamic Object Runtime to look up static methods or properties in our class and then invoke them.

```
/// <summary>
/// Helper class to invoke static methods on a dynamic object since C# dynamic type doesn't support this out of the box.
/// </summary>
public class StaticMembersDynamicWrapper : DynamicObject
{
    private Type _type;

    public StaticMembersDynamicWrapper(Type type) 
    {
        _type = type; 
    }

    // Handle static properties
    public override bool TryGetMember(GetMemberBinder binder, out object result)
    {
        // look up the property info
        PropertyInfo prop = _type.GetProperty(binder.Name, BindingFlags.FlattenHierarchy | BindingFlags.Static | BindingFlags.Public);
        // if not found, then return null for the property (false means we couldn't find it)
        if (prop == null)
        {
            result = null;
            return false;
        }

        // put the property value into result
        result = prop.GetValue(null, null);
        // return that the property was found
        return true;
    }

    // Handle static methods
    public override bool TryInvokeMember(InvokeMemberBinder binder, object[] args, out object result)
    {
        // get an array of the parameter types
        var argTypes = args.Select(arg => arg.GetType());

        // find the method information (validated using the parameter types)
        MethodInfo method = _type.GetMethod(binder.Name, BindingFlags.FlattenHierarchy | BindingFlags.Static | BindingFlags.Public,
            null, argTypes.ToArray(), null);
        // if not found, return
        if (method == null)
        {
            result = null;
            return false;
        }

        // call the method and return
        result = method.Invoke(null, args);
        return true;
    }
}
```

This isn't flawless.  First, it only retrieves properties; you can't set them with this.

Also, It doesn't do polymorphism very well.  My testing shows that the parameter types have to match exactly.  You could relax the matching by eliminating the parameter type array when looking up the ``MethodInfo``, but I find it useful and wouldn't recommend it.

Still, this has been a very useful snippet for me to have when you need to call static members on a dynamic object.  Hope you find it useful as well.

## License

Just for clarity, this snippet is released under the [MIT License](http://opensource.org/licenses/MIT).

## Credit

This article was modified from an MSDN [article](http://blogs.msdn.com/b/davidebb/archive/2009/10/23/using-c-dynamic-to-call-static-members.aspx) by David Ebbo.
