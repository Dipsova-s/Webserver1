using System;
using NUnitLite;
using System.IO;
using System.Reflection;
using System.Collections.Generic;

namespace EveryAngle.OData.IntegrationTests.Runner
{
    public class TestRunner
    {
        public void Run(string testCategories)
        {
            string resultPath = Path.Combine(
                Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location),
                string.Format("Testrun-{0}", DateTime.Now.ToString("yyyyMMdd_HHmmssfff")),
                "Testresult");

            List<string> args = new List<string>();
            args.Add(string.Format("/work:{0}", resultPath));
            args.Add(string.Format("/result:OData_{0}.xml;format=nunit2", testCategories));

            if (!string.IsNullOrEmpty(testCategories))
            {
                args.Add(string.Format("/where: {0}", GetTestCategories(testCategories)));
            }

            new AutoRun(Assembly.GetExecutingAssembly()).Execute(args.ToArray());
        }

        private static string GetTestCategories(string categories)
        {
            string testCategory = string.Empty;
            string[] testCycleStrings = categories.Split(',');

            foreach (string category in testCycleStrings)
            {
                if (!string.IsNullOrEmpty(testCategory))
                    testCategory += " || ";

                testCategory += string.Format("cat == {0}", category.Trim());
            }

            return testCategory;
        }
    }
}
