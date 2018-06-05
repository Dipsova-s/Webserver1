using EveryAngle.Core.ViewModels.Model;
using Newtonsoft.Json;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class AngleWarningsViewModelTest : UnitTestBase
    {
        private static AngleWarningsViewModel angleWarningsViewModel = new AngleWarningsViewModel();
        private static AngleWarningsSummaryViewModel angleWarningsSummaryViewModel = new AngleWarningsSummaryViewModel();
        private static AngleWarningsSolutionsViewModel angleWarningsSolutionsViewModel = new AngleWarningsSolutionsViewModel();

        #region Setup

        [SetUp]
        public override void Setup()
        {
            InitialAngleWarningsViewModel();
            InitialAngleWarningsSummaryViewModel();
            InitialAngleWarningsSolutionsViewModel();
        }

        #endregion

        #region Tests

        [TestCase(1, typeof(int), "fakeId")]
        [TestCase(1, typeof(int), "ParentId")]
        [TestCase("test", typeof(string), "Id")]
        [TestCase("name", typeof(string), "Name")]
        [TestCase(true, typeof(bool), "hasChildren")]
        [TestCase(0, typeof(int), "Level")]
        [TestCase(null, null, "DataFirstLevel")]
        [TestCase(null, null, "DataSecondLevel")]
        [TestCase(null, null, "DataThirdLevel")]
        public void AngleWarningsViewModel_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                //assert type
                Assert.AreEqual(typeOfValue, expected);
            }
            
            if (expectedField == "DataFirstLevel")
	            Assert.AreEqual(angleWarningsViewModel.DataFirstLevel.GetType(), typeof(AngleWarningFirstLevelViewmodel));
            
            if (expectedField == "DataSecondLevel")
                Assert.AreEqual(angleWarningsViewModel.DataSecondLevel.GetType(), typeof(AngleWarningSecondLevelViewmodel));

            if (expectedField == "DataThirdLevel")
                Assert.AreEqual(angleWarningsViewModel.DataThirdLevel.GetType(), typeof(AngleWarningThirdLevelViewmodel));
            
            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(angleWarningsViewModel);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        [TestCase(0, typeof(int), "angles_total")]
        [TestCase(1, typeof(int), "angles_with_warnings")]
        [TestCase(2, typeof(int), "displays_total")]
        [TestCase(3, typeof(int), "displays_with_warnings")]
        [TestCase(4, typeof(int), "errors_total")]
        [TestCase(5, typeof(int), "warnings_total")]
        [TestCase(6, typeof(int), "warnings_unique")]
        public void AngleWarningsSummaryViewModel_TEST(object value, Type expected, string expectedField)
        {
            Type typeOfValue = value.GetType();
            //assert type
            Assert.AreEqual(typeOfValue, expected);

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(angleWarningsSummaryViewModel);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        [TestCase("action", typeof(string), "action")]
        [TestCase("name", typeof(string), "name")]
        [TestCase("type", typeof(string), "parameter_type")]
        [TestCase("selection", typeof(string), "parameter_selection")]
        [TestCase(null, null, "warning_types")]
        public void AngleWarningsSolutionsViewModel_TEST(object value, Type expected, string expectedField)
        {
            if (value != null)
            {
                Type typeOfValue = value.GetType();
                Assert.AreEqual(typeOfValue, expected);
            }

            if (expectedField == "warning_types")
                Assert.AreEqual(angleWarningsSolutionsViewModel.WarningTypes.GetType(), typeof(List<string>));

            //assert json serialize
            var viewModelSerialize = JsonConvert.SerializeObject(angleWarningsSolutionsViewModel);
            Assert.IsTrue(viewModelSerialize.Contains(expectedField));
        }

        #endregion

        #region Helper

        private static void InitialAngleWarningsSolutionsViewModel()
        {
            //arrange
            angleWarningsSolutionsViewModel = new AngleWarningsSolutionsViewModel
            {
                Action = "action",
                Name = "name",
                ParameterType = "type",
                ParameterSelection = "selection",
                WarningTypes = new List<string>()
            };
        }

        private static void InitialAngleWarningsViewModel()
        {
            //arrange
            angleWarningsViewModel = new AngleWarningsViewModel
            {
                fakeId = 1,
                ParentId = 1,
                Id = "test",
                Name = "name",
                hasChildren = true,
                Level = 0,
                DataFirstLevel = new AngleWarningFirstLevelViewmodel(),
                DataSecondLevel = new AngleWarningSecondLevelViewmodel(),
                DataThirdLevel = new AngleWarningThirdLevelViewmodel()
            };
        }

        private static void InitialAngleWarningsSummaryViewModel()
        {
            //arrange
            angleWarningsSummaryViewModel = new AngleWarningsSummaryViewModel
            {
                AnglesTotal = 0,
                AnglesWarnings = 1,
                DisplaysTotal = 2,
                DisplaysWarnings = 3,
                ErrorsTotal = 4,
                WarningsTotal = 5,
                WarningsUnique = 6
            };
        }

        #endregion
    }
}
