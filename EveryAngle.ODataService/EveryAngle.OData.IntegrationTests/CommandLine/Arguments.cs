using EveryAngle.OData.IntegrationTests.Base;
using EveryAngle.OData.Utils.Logs;
using System;
using System.Collections.Specialized;
using System.Text.RegularExpressions;
using System.Threading;

namespace EveryAngle.OData.IntegrationTests.CommandLine
{
    public class Arguments
    {
        // Variables
        private StringDictionary Parameters;

        /// <summary>
        /// Constructor for the arguments class
        /// </summary>
        public Arguments()
        {
        }

        /// <summary>
        /// Constructor for the arguments class
        /// </summary>
        /// <param name="Args"></param>
        public Arguments(string[] Args)
        {
            Parameters = new StringDictionary();
            Regex Spliter = new Regex(@"^-{1,2}|^/|=|:",
                RegexOptions.IgnoreCase | RegexOptions.Compiled);

            Regex Remover = new Regex(@"^['""]?(.*?)['""]?$",
                RegexOptions.IgnoreCase | RegexOptions.Compiled);

            string Parameter = null;
            string[] Parts;

            // Valid parameters forms:
            // {-,/,--}param{ ,=,:}((",')value(",'))
            // Examples:
            // -param1 value1 --param2 /param3:"Test-:-work"
            //   /param4=happy -param5 '--=nice=--'
            foreach (string Txt in Args)
            {
                // Look for new parameters (-,/ or --) and a
                // possible enclosed value (=,:)
                Parts = Spliter.Split(Txt, 3);

                switch (Parts.Length)
                {
                    // Found a value (for the last parameter
                    // found (space separator))
                    case 1:
                        if (Parameter != null)
                        {
                            if (!Parameters.ContainsKey(Parameter))
                            {
                                Parts[0] =
                                    Remover.Replace(Parts[0], "$1");

                                Parameters.Add(Parameter, Parts[0]);
                            }
                            Parameter = null;
                        }
                        // else Error: no parameter waiting for a value (skipped)
                        break;

                    // Found just a parameter
                    case 2:
                        // The last parameter is still waiting.
                        // With no value, set it to true.
                        if (Parameter != null)
                        {
                            if (!Parameters.ContainsKey(Parameter))
                                Parameters.Add(Parameter, "true");
                        }
                        Parameter = Parts[1];
                        break;

                    // Parameter with enclosed value
                    case 3:
                        // The last parameter is still waiting.
                        // With no value, set it to true.
                        if (Parameter != null)
                        {
                            if (!Parameters.ContainsKey(Parameter))
                                Parameters.Add(Parameter, "true");
                        }

                        Parameter = Parts[1];

                        // Remove possible enclosing characters (",')
                        if (!Parameters.ContainsKey(Parameter))
                        {
                            Parts[2] = Remover.Replace(Parts[2], "$1");
                            Parameters.Add(Parameter, Parts[2]);
                        }

                        Parameter = null;
                        break;
                }
            }
            // In case a parameter is still waiting
            if (Parameter != null)
            {
                if (!Parameters.ContainsKey(Parameter))
                    Parameters.Add(Parameter, "true");
            }
        }

        /// <summary>
        /// retrieve a parameter value if it exists
        /// (overriding C# indexer property
        /// </summary>
        /// <param name="Param"></param>
        /// <returns></returns>
        public string this[string Param]
        {
            get
            {
                return (Parameters[Param]);
            }
        }

        /// <summary>
        /// Process the commandline arguments
        /// for description use: {solutionname}.exe -help
        /// </summary>
        /// <param name="args"></param>
        /// <returns></returns>
        public void ProcessArgs()
        {
            string message;

            if (Parameters["help"] == null)
            {
                //set the base url
                if (Parameters["BaseUri"] != null)
                {
                    string baseUri = Parameters["BaseUri"];

                    message = string.Format("Base URI is set to: {0}", baseUri);
                    TestBase.BaseUri = new Uri(baseUri, UriKind.Absolute);
                    TestBase.UseCommandLineBaseUriSetting = true;
                    LogService.Info(message);
                }
                else
                {
                    message = "Base URL not set, running tests with default settings";
                    LogService.Info(message);
                }

                //set the odata url
                if (Parameters["ODataUri"] != null)
                {
                    string oDataUri = Parameters["ODataUri"];

                    message = string.Format("OData URI is set to: {0}", oDataUri);
                    TestBase.ODataUri = new Uri(oDataUri, UriKind.Absolute);
                    TestBase.UseCommandLineODataUriSetting = true;
                    LogService.Info(message);
                }
                else
                {
                    message = "OData URL not set, running tests with default settings";
                    LogService.Info(message);
                }

                if (Parameters["TestCategories"] != null)
                {
                    string categories = Parameters["TestCategories"];
                    message = string.Format("TestCategories to execute: {0}", categories);
                    TestBase.TestCategories = categories;
                    LogService.Info(message);
                }
                else
                {
                    message = "TestCategories not defined, running all tests!";
                    LogService.Info(message);
                }

                if (Parameters["Thumbprint"] != null)
                {
                    string thumbprint = Parameters["Thumbprint"];
                    message = string.Format("Thumbprint to execute: {0}", thumbprint);
                    TestBase.Thumbprint = thumbprint;
                    LogService.Info(message);
                }
                else
                {
                    message = "Thumbprint not defined";
                    LogService.Info(message);
                }
            }
            else
            {
                PrintHelpText();
            }
        }

        private void PrintHelpText()
        {
            Console.WriteLine("");
            Console.WriteLine("");
            Console.WriteLine("  ******************************************  ");
            Console.WriteLine("  ******************************************  ");
            Console.WriteLine("  **                                      **  ");
            Console.WriteLine("  **    Every Angle OData Integration Test    **  ");
            Console.WriteLine("  **                 HELP                 **  ");
            Console.WriteLine("  **                                      **  ");
            Console.WriteLine("  ******************************************  ");
            Console.WriteLine("  ******************************************  ");
            Console.WriteLine("  How to use:");
            Console.WriteLine("  Options:");
            Console.WriteLine("  - BaseUri: [ string ] : Application Server url of the system-under-test.");
            Console.WriteLine("  - ODataUri: [ string ] : OData url of the system-under-test.");
            Console.WriteLine("  - TestCategoires: [ setup | smoke | acceptance ] : Use commas to separate the test categories to run.");
            Console.WriteLine("");
            Console.WriteLine("  When starting the application without any of these options, the settings from the configfile will be used!");
            Console.WriteLine("");
            Console.WriteLine("  Hit ENTER to exit.");
            Console.ReadKey(true);

            Exit(-1);
        }

        /// <summary>
        /// exit the run
        /// </summary>
        /// <param name="exitCode"></param>
        public void Exit(int exitCode)
        {
            if (exitCode != 0)
                Console.Write("Something went wrong. Please check the logs for errors.");

            Console.Write("Exiting execution in 2 seconds...");
            Thread.Sleep(2000);
            Environment.Exit(exitCode);
        }
    }
}
