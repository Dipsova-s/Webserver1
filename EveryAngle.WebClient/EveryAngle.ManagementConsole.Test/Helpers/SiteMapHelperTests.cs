using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.ManagementConsole.Models;
using NUnit.Framework;
using System.Collections.Generic;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class SiteMapHelperTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            InitiateTestingContext();
            base.Setup();
        }

        [TearDown]
        public override void TearDown()
        {
            // revert back
            SiteMapHelper.SetSiteMaps(new List<SiteMapModel.SiteMap>());
            base.TearDown();
        }

        #endregion

        #region tests    

        [TestCase]
        public void Can_GetSiteMap()
        {
            List<SiteMapModel.SiteMap> sitemaps = SiteMapHelper.GetSiteMap(true);

            // assert
            Assert.IsEmpty(sitemaps);
        }

        [TestCase]
        public void Can_GetSiteMapByHashPath()
        {
            SiteMapModel.SiteMap sitemap = SiteMapHelper.GetSiteMapByHashPath("//");

            // assert
            Assert.IsNotNull(sitemap);
        }

        [TestCase]
        public void Can_SetSiteMaps()
        {
            List<SiteMapModel.SiteMap> sitemaps = GetTestingSitemaps();
            SiteMapHelper.SetSiteMaps(sitemaps);
            List<SiteMapModel.SiteMap> testingSitemaps = SiteMapHelper.GetSiteMap(true);

            // assert
            Assert.AreEqual(1, testingSitemaps.Count);
        }

        [TestCase]
        public void Can_GetActionHash()
        {
            List<SiteMapModel.SiteMap> sitemaps = GetTestingSitemaps();
            SiteMapHelper.SetSiteMaps(sitemaps);
            string actionHash = SiteMapHelper.ActionHash("actions/12");

            // assert
            Assert.AreEqual("#/", actionHash);
        }

        [TestCase]
        public void Can_RenderItem()
        {
            List<SiteMapModel.SiteMap> sitemaps = GetTestingSitemaps();
            SiteMapHelper.SetSiteMaps(sitemaps);
            MvcHtmlString mvcContent = SiteMapHelper.RenderItem(sitemaps[0], 1);

            // assert
            Assert.IsNotNull(mvcContent);
        }

        #endregion

        #region private/protected functions

        private List<SiteMapModel.SiteMap> GetTestingSitemaps()
        {
            return new List<SiteMapModel.SiteMap>
            {
                new SiteMapModel.SiteMap
                {
                    Id = "test_id",
                    Parameters = "1",
                    HashPath = "/"
                }
            };
        }

        #endregion
    }
}
