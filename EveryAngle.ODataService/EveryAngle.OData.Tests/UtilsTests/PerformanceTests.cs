using EveryAngle.OData.DTO;
using NUnit.Framework;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace EveryAngle.OData.Tests.UtilsTests
{
    [TestFixture(Category = "Utilities")]
    public class PerformanceTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [Ignore("Unstable test, it depends on running machine.")]
        [TestCase]
        [Timeout(1000)]
        public void Can_SurpressListPerformance()
        {
            // test with composite key here.
            ConcurrentDictionary<AngleCompositeKey, Angle> concurrentAngles = new ConcurrentDictionary<AngleCompositeKey, Angle>();
            IList<Angle> listAngles = new List<Angle>();
            for (int i = 0; i < 500; i++)
            {
                Angle angle = new Angle { uri = string.Format("models/1/angles/{0}", i) };
                concurrentAngles.TryAdd(angle.CompositeKey, angle);
                listAngles.Add(angle);
            }

            Stopwatch concurrentWatch = new Stopwatch();
            Stopwatch listWatch = new Stopwatch();
            AngleCompositeKey key = new AngleCompositeKey { InternalId = 499, Uri = "models/1/angles/499" };

            listWatch.Start();
            Angle getListAngle = listAngles.First(x => x.uri == key.Uri); //NOSONAR
            listWatch.Stop();

            concurrentWatch.Start();
            Angle getConcurrentAngle = concurrentAngles[key]; //NOSONAR
            concurrentWatch.Stop();

            // basically 1 millisecond == 10,000 ticks.
            // the concurrent object should always surpress list object with faster performance.
            Assert.IsTrue(listWatch.ElapsedTicks > concurrentWatch.ElapsedTicks);
            // expected time should be lower than  30000 ticks. (3ms).
            Assert.IsTrue(concurrentWatch.ElapsedTicks < 30000, "Expected elapse tick less than 5000 but it was {0}", concurrentWatch.ElapsedTicks);
        }

        #endregion
    }
}
