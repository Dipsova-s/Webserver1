using EveryAngle.OData.IntegrationTests.Base;
using EveryAngle.OData.IntegrationTests.CommandLine;
using EveryAngle.OData.IntegrationTests.Runner;
using EveryAngle.OData.Utils.Logs;
using System.Linq;

namespace EveryAngle.OData.IntegrationTests
{
    public class Program
    {
        static void Main(string[] args)
        {
            string message = "  ** Starting Every Angle OData Integration Tests **  ";
            LogService.Info(message);

            if (!args.Any())
            {
                message = "No arguments given for Uris and test categoires .. stopping test run";
                LogService.Error(message);
                new Arguments().Exit(-1);
            }
            TestRunner runner = new TestRunner();

            message = "Starting TestRun with the following arguments: ";
            LogService.Info(message);

            int count = 1;
            foreach (string arg in args)
            {
                message = string.Format("  == {0} == {1}", count, arg);
                LogService.Info(message);
                count++;
            }

            new Arguments(args).ProcessArgs();

            runner.Run(TestBase.TestCategories);
        }
    }
}