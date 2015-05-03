# The Last Configuration Reader *I* Will Ever Need

While working on my unit tests, I ran into a problem loading test data from a configuration file using the default [TestConfiguration](http://msdn.microsoft.com/en-us/library/microsoft.visualstudio.testtools.unittesting.testconfiguration.aspx) object. After failing to diagnose the problem, I ventured on my own to loading the test configuration data.

Loading settigs from configuration files in .NET is tried and true practice. Many articles have been written and the .NET framework has an [entire namespace](http://msdn.microsoft.com/en-us/library/System.Configuration.aspx) devoted to managing configuration information.

During my research into loading configurations, I stumbled across an [article](https://sites.google.com/site/craigandera/craigs-stuff/clr-workings/the-last-configuration-section-handler-i-ll-ever-need) by Craig Andera about loading settings directly into an object using the XmlSerializer. This technique has proven quite popular[^popular].

[^popular]: The following articles also reference XmlSerializerSectionHandler: http://haacked.com/archive/2004/06/24/verylastconfigurationsectionhandler.aspx, http://stackoverflow.com/questions/2984432/how-to-read-in-a-list-of-custom-configuration-objects, http://blogs.msdn.com/b/dotnetinterop/archive/2005/02/12/371588.aspx

The configurations for my tests were pretty simple. Each test had a section in the app.config named after the test. Within the test's section were common elements shared by all the tests.

```
<configuration>
  <configSections>
    <section name="MyTest" type="MySoftware.XmlSerializerSectionHandler, MyTestAssembly" />
  </configSections>
  ...
  <MyTest type="TestCsvConfig, MyTestsAssembly">
    <Data>file1.csv</Data>
    <Results>results1.csv</Results>
  </MyTest>
  <MyTest2 type="TestCsvConfig, MyTestsAssembly">
    <Data>file2.csv</Data>
    <Results>results2.csv</Results>
  </MyTest2>
</configuration>
```

These configurations are identical other than the names of the sections they're in.  Since they're identical, we want to load these into the same type, TestCsvConfig, as mentioned in the type attribute.  (I load the data into some objects from a .csv file, operate on it, and then compare it to data loaded from another .csv file.)

```
public class TestCsvConfig
{
    // data to load into the database
    public property Data { get; set; }
    // data to compare against to verify results
    public property Results { get: set; }
}
```

However, while each test has the same parameters, they can't have the same name in the config file.  (Well, technically they could, but it would be a pain.)

The problem with using the `XmlSerializerSectionHandler` as written is that it loads XML sections that match the type name only.    To get it to read from arbitrary sections, we must set the root node in an override.

```
public class XmlSerializerSectionHandler : IConfigurationSectionHandler
{
    public object Create(
         object parent,
         object configContext,
         System.Xml.XmlNode section)
    {
    	// read the type name of the object to marshall the data into
        XPathNavigator nav = section.CreateNavigator();
        string typename = (string)nav.Evaluate("string(@type)");
        Type t = Type.GetType(typename);
        XmlAttributes attrs = new XmlAttributes();
        
        // establish the overrides necessary for the root node to be named differently
        XmlRootAttribute rootAttr = new XmlRootAttribute(section.Name);
        attrs.XmlRoot = rootAttr;
        XmlAttributeOverrides overrides = new XmlAttributeOverrides();
        overrides.Add(t, attrs);
        
        // marshall the XML into the object
        XmlSerializer ser = new XmlSerializer(t, overrides);
        XmlNodeReader nodeReader = new XmlNodeReader(section);
        return ser.Deserialize(nodeReader);
    }
}
```
Add four little lines to establish the root node, and voilà, now we can use sections with different names.
To use it is easy peasy:
```
   TestCsvConfig config = (TestCsvConfig) ConfigurationManager.GetSection("MyTest2");```

Now I can easily store test configurations within the app.config and easily retrieve it by test name.

*This software is licensed under the same license as Mr. Andera's original software.*
