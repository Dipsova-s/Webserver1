using NUnit.Framework;
using System;

namespace EveryAngle.Core.ViewModels.Tests
{
    [TestFixture(Category = "MC")]
    public abstract class UnitTestBase
    {
        protected string TestResourcesPath = AppDomain.CurrentDomain.BaseDirectory + "TestResources\\";

        [SetUp]
        public virtual void Setup()
        {

        }

        [TearDown]
        public virtual void TearDown()
        {

        }
    }
}
