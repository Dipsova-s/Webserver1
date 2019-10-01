using EveryAngle.OData.DTO;
using EveryAngle.OData.ViewModel;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.OData.Tests.ViewModelTests
{
    public class EntryEntitiesViewModelTest : UnitTestBase
    {
        #region private variables

        private EntryEntitiesViewModel entryEntitiesViewModel;
        private string webclientrui = "https://nl-webmb03.everyangle.org/testserver";

        #endregion private variables

        [SetUp]
        public void Setup()
        {
            Initialize();
        }

        [TearDown]
        public void TearDown()
        {
            // re-init to clear all mock data
            Initialize();
        }

        #region tests

        [TestCase]
        public void Should_Return_Correct_Angle_Properties()
        {
            Angle angle = new Angle();
            angle.name = "test_angle";
            angle.id = "1";
            angle.uri = "/models/1/angles/1";
            angle.is_template = false;
            angle.displays_summary = new List<DisplaysSummary>();

            entryEntitiesViewModel = new EntryEntitiesViewModel(angle, webclientrui);
            Assert.AreEqual(angle.name, entryEntitiesViewModel.name);
            Assert.AreEqual(Convert.ToInt32(angle.id), entryEntitiesViewModel.entity_id);
            Assert.AreEqual("https://nl-webmb03.everyangle.org/testserver/en/angle/anglepage#/?angle=/models/1/angles/1&display=default", entryEntitiesViewModel.web_client_uri);
            Assert.AreEqual(angle.is_template, entryEntitiesViewModel.is_template);
            Assert.AreEqual("angle", entryEntitiesViewModel.item_type);
            Assert.AreEqual(false, entryEntitiesViewModel.hasChildren);

            angle.is_template = true;
            entryEntitiesViewModel = new EntryEntitiesViewModel(angle, webclientrui);
            Assert.AreEqual("template", entryEntitiesViewModel.item_type);
        }

        [TestCase]
        public void Should_Return_Correct_Display_Properties()
        {
            Angle angle = new Angle();
            angle.name = "test_angle";
            angle.id = "1";
            angle.uri = "/models/1/angles/1";
            angle.is_template = false;
            angle.displays_summary = new List<DisplaysSummary>();

            Display display = new Display();
            display.angle_id = "1";
            display.name = "test_display";
            display.display_type = "list";
            display.uri = "/models/1/angles/1/displays/1";
            display.SetAngle(angle);

            entryEntitiesViewModel = new EntryEntitiesViewModel(display, webclientrui);
            Assert.AreEqual(display.name, entryEntitiesViewModel.name);
            Assert.AreEqual("https://nl-webmb03.everyangle.org/testserver/en/angle/anglepage#/?angle=/models/1/angles/1&display=/models/1/angles/1/displays/1", entryEntitiesViewModel.web_client_uri);
            Assert.AreEqual(display.angle_id, entryEntitiesViewModel.parent_id.ToString());
            Assert.AreEqual("list", entryEntitiesViewModel.item_type);
            Assert.AreEqual(2000002, entryEntitiesViewModel.entity_id);
            Assert.AreEqual("test_angle_test_display_L1_1_1", entryEntitiesViewModel.entity_uri);
            Assert.AreEqual(false, entryEntitiesViewModel.hasChildren);
        }

        #endregion tests
    }
}