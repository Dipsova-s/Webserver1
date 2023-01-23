using EveryAngle.Core.ViewModels.About;
using EveryAngle.ManagementConsole.Helpers;
using Kendo.Mvc;
using Kendo.Mvc.UI;
using NUnit.Framework;
using System.Collections.Generic;
using System.ComponentModel;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class PageHelperTests : UnitTestBase
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

        [TestCase(ListSortDirection.Ascending, "&sort=id&dir=asc")]
        [TestCase(ListSortDirection.Descending, "&sort=id&dir=desc")]
        public void Can_GetQueryString_DownloadTable(ListSortDirection direction, string expectedValue)
        {
            DataSourceRequest request = GetDataSourceRequest("id", direction);
            Assert.AreEqual(expectedValue, PageHelper.GetQueryString(request, QueryString.DownloadTable));
        }

        [TestCase(ListSortDirection.Ascending, "id", "&sort=id&dir=asc")]
        [TestCase(ListSortDirection.Descending, "name", "&sort=name&dir=desc")]
        [TestCase(ListSortDirection.Ascending, "abbreviation", "&sort=abbreviation&dir=asc")]
        [TestCase(ListSortDirection.Ascending, "CreatedBy.Fullname", "&sort=created_by&dir=asc")]
        [TestCase(ListSortDirection.Ascending, "CreatedBy.Created", "&sort=created_on&dir=asc")]
        [TestCase(ListSortDirection.Ascending, "description", "&sort=description&dir=asc")]
        public void Can_GetQueryString_LabelCategories(ListSortDirection direction, string queryMember, string expectedValue)
        {
            DataSourceRequest request = GetDataSourceRequest(queryMember, direction);
            Assert.AreEqual(expectedValue, PageHelper.GetQueryString(request, QueryString.LabelCategories));
        }

        [TestCase(ListSortDirection.Ascending, "UserID", "&sort=user&dir=asc")]
        [TestCase(ListSortDirection.Descending, "ReanableIpAddresses", "&sort=ip_addresses&dir=desc")]
        [TestCase(ListSortDirection.Ascending, "IsActive", "&sort=last_activity&dir=asc")]
        [TestCase(ListSortDirection.Ascending, "Created", "&sort=created&dir=asc")]
        [TestCase(ListSortDirection.Ascending, "ExpirationTime", "&sort=expiration_time&dir=asc")]
        [TestCase(ListSortDirection.Ascending, "Ip", "&sort=ip_addresses&dir=asc")]
        public void Can_GetQueryString_Users(ListSortDirection direction, string queryMember, string expectedValue)
        {
            DataSourceRequest request = GetDataSourceRequest(queryMember, direction);
            Assert.AreEqual(expectedValue, PageHelper.GetQueryString(request, QueryString.Users));
        }

        [TestCase(ListSortDirection.Ascending, "Id", "&sort=id&dir=asc")]
        [TestCase(ListSortDirection.Descending, "CreatedBy.Created", "&sort=created_on&dir=desc")]
        [TestCase(ListSortDirection.Ascending, "Description", "&sort=description&dir=asc")]
        [TestCase(ListSortDirection.Ascending, "CreatedBy.Fullname", "&sort=created_by&dir=asc")]
        public void Can_GetQueryString_SystemRole(ListSortDirection direction, string queryMember, string expectedValue)
        {
            DataSourceRequest request = GetDataSourceRequest(queryMember, direction);
            Assert.AreEqual(expectedValue, PageHelper.GetQueryString(request, QueryString.SystemRole));
        }

        [TestCase(ListSortDirection.Ascending, "Id", "&sort=id&dir=asc")]
        [TestCase(ListSortDirection.Descending, "CreatedBy.Created", "&sort=created_on&dir=desc")]
        [TestCase(ListSortDirection.Ascending, "Description", "&sort=description&dir=asc")]
        [TestCase(ListSortDirection.Ascending, "CreatedBy.Fullname", "&sort=created_by&dir=asc")]
        public void Can_GetQueryString_Role(ListSortDirection direction, string queryMember, string expectedValue)
        {
            DataSourceRequest request = GetDataSourceRequest(queryMember, direction);
            Assert.AreEqual(expectedValue, PageHelper.GetQueryString(request, QueryString.Role));
        }

        [TestCase(ListSortDirection.Ascending, "name", "&sort=name&dir=asc")]
        [TestCase(ListSortDirection.Descending, "plugin_name", "&sort=type&dir=desc")]
        [TestCase(ListSortDirection.Ascending, "allow_write", "&sort=allow_write&dir=asc")]
        public void Can_GetQueryString_Datastores(ListSortDirection direction, string queryMember, string expectedValue)
        {
            DataSourceRequest request = GetDataSourceRequest(queryMember, direction);
            Assert.AreEqual(expectedValue, PageHelper.GetQueryString(request, QueryString.Datastores));
        }

        [TestCase]
        public void Can_GetQueryString_EmptyQueries()
        {
            DataSourceRequest request = new DataSourceRequest { Sorts = new List<SortDescriptor>() };
            Assert.AreEqual(string.Empty, PageHelper.GetQueryString(request, QueryString.Datastores));
        }

        [TestCase]
        public void Can_GetQueryString_NonExistQueries()
        {
            DataSourceRequest request = GetDataSourceRequest("id", ListSortDirection.Ascending);
            Assert.AreEqual(string.Empty, PageHelper.GetQueryString(request, (QueryString)9));
        }

        [TestCase]
        public void Can_GetHeaderWithTimezone()
        {
            string headerText = "IAM HEADER TEXT";
            string expectedHTMLText = string.Format("<span data-tooltip-title=\"MC.util.getTimezoneText\">{0}</span>", headerText);
            Assert.IsNotNullOrEmpty(PageHelper.HeaderWithTimezone(headerText));
            Assert.AreEqual(expectedHTMLText, PageHelper.HeaderWithTimezone(headerText));
        }

        [TestCase]
        public void Can_GetModelTimestamp()
        {
            //arrange
            AboutModel aboutModel = new AboutModel
            {
                model_id = "EA2_800",
                version = "version 5.0",
                status = "up",
                modeldata_timestamp = 1497514623
            };
            var expected = "<span data-role=localize>1497514623</span>";

            var result = PageHelper.GetModelTimestamp(aboutModel);

            Assert.AreEqual(expected, result);
        }

        [Test]
        public void Can_GetWebclientUrl()
        {
            var result = PageHelper.GetWebclientUrl();
            Assert.AreEqual(string.Empty, result);
        }

        #endregion

        #region private/protected functions

        private DataSourceRequest GetDataSourceRequest(string member, ListSortDirection direction)
        {
            return new DataSourceRequest
            {
                Sorts = new List<SortDescriptor>
                {
                    new SortDescriptor
                    {
                        Member = member,
                        SortDirection = direction
                    }
                }
            };
        }

        #endregion
    }
}
