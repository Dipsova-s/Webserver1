using EveryAngle.ManagementConsole.Helpers;
using NUnit.Framework;
using StackExchange.Profiling;
using System.Web;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class ProfilerTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            InitiateTestingContext();
            base.Setup();
        }

        #endregion

        #region tests    

        [TestCase]
        public void Can_Initialize()
        {
            MiniProfiler.Settings.IgnoredPaths = new string[] { "iam_ignored" };
            Profiler.Initialize();

            // assertion 
            Assert.AreEqual(10, MiniProfiler.Settings.IgnoredPaths.Length);
            Assert.Contains("images", MiniProfiler.Settings.IgnoredPaths);
            Assert.Contains("style", MiniProfiler.Settings.IgnoredPaths);
            Assert.Contains("include", MiniProfiler.Settings.IgnoredPaths);
            Assert.Contains("jsdebug", MiniProfiler.Settings.IgnoredPaths);
            Assert.Contains(".axd", MiniProfiler.Settings.IgnoredPaths);
            Assert.Contains(".js", MiniProfiler.Settings.IgnoredPaths);
            Assert.Contains(".png", MiniProfiler.Settings.IgnoredPaths);
            Assert.Contains(".svg", MiniProfiler.Settings.IgnoredPaths);
            Assert.Contains(".ashx", MiniProfiler.Settings.IgnoredPaths);
        }

        [TestCase]
        public void Can_Initialize_Null()
        {
            MiniProfiler.Settings.IgnoredPaths = null;
            Profiler.Initialize();

            // assertion 
            Assert.AreEqual(null, MiniProfiler.Settings.IgnoredPaths);
        }

        [TestCase]
        public void Can_StartProfiler()
        {
            // just execute, cannot really test here.
            Profiler.Start(null);
            Profiler.Start(HttpContext.Current);

            Profiler.Stop();
        }

        [TestCase]
        public void Can_CreateProfilerSettingInstantiate()
        {
            // running by static ctor
            Assert.IsFalse(Profiler.ProfilerSetting.CheckUser(null));

            // add profiler target
            Profiler.ProfilerSetting.ProfilerTargetLoginCommaSeparatedList = new string[] { "test_profiler" };
            Assert.IsTrue(Profiler.ProfilerSetting.CheckUser("test_profiler"));
        }

        #endregion
    }
}
