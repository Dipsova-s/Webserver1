using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Comment;
using EveryAngle.Core.ViewModels.Directory;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Controllers;
using Kendo.Mvc.UI;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Text;
using System.Web.Mvc;

namespace EveryAngle.ManagementConsole.Test.Controllers
{
    public class CommentControllerTests : UnitTestBase
    {
        #region private variables

        private CommentController _testingController;
        private UserViewModel _testingUser;
        private FormCollection _testingFormCollection;

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            // call base
            base.Setup();

            // prepare
            _testingUser = new UserViewModel { Uri = new Uri("/users/1", UriKind.Relative) };
            authorizationHelper.SetupGet(x => x.CurrentUser).Returns(_testingUser);
            authorizationHelper.SetupGet(x => x.SystemSettings).Returns(new SystemSettingViewModel { default_pagesize = 10 });
            authorizationHelper.SetupGet(x => x.Version).Returns(new VersionViewModel
            {
                Version = "1",
                Entries = new List<Entry> { new Entry { Name = "comments", Uri = new Uri("/comments", UriKind.Relative) } }
            });

            commentService.Setup(x => x.UpdateComment(It.IsAny<string>(), It.IsAny<string>())).Returns(new CommentViewModel());
            commentService.Setup(x => x.GetCommentsByType(It.IsAny<string>())).Returns(new ListViewModel<CommentViewModel>
            {
                Header = new HeaderViewModel { Total = 1 },
                Data = new List<CommentViewModel>
                {
                    new CommentViewModel { CreatedBy = new UserDateViewModel { Created = 1 } }
                }
            });

            // assign
            _testingController = new CommentController(commentService.Object, authorizationHelper.Object);
        }

        #endregion

        #region tests

        [TestCase]
        public void Can_InitiateConstructor()
        {
            // execute
            Action action = new Action(() =>
            {
                _testingController = new CommentController(commentService.Object);
                _testingController = new CommentController(commentService.Object, authorizationHelper.Object);
            });

            // assert
            Assert.DoesNotThrow(action.Invoke);
        }

        [TestCase("commentType")]
        public void Can_GetCommentsByType(string commentType)
        {
            // execute
            _testingController.GetCommentsByType(commentType);

            // assert
            Assert.AreEqual(10, _testingController.ViewData["DefaultPageSize"]);
            Assert.AreEqual(commentType, _testingController.ViewBag.CommentType);
            Assert.AreEqual(_testingUser.Uri, _testingController.ViewBag.CurrentUserUri);
        }

        [TestCase("commentType_1", "/comments/1", "comment_message_1")]
        [TestCase("commentType_2", "", "comment_message_2")]
        [TestCase("commentType_3", null, "comment_message_3")]
        [TestCase("commentType_4", "   ", "comment_message_4")]
        public void Can_AddComment(string commentType, string commentUri, string message)
        {
            // prepare
            _testingFormCollection = new FormCollection();
            _testingFormCollection.Add("commentUri", commentUri);
            _testingFormCollection.Add("message", commentUri);
            _testingFormCollection.Add("commentType", commentType);

            // execute
            ContentResult contentResult = _testingController.AddComment(_testingFormCollection, commentType) as ContentResult;

            // assert
            Assert.IsNotNull(contentResult);
            Assert.AreEqual("text/plain", contentResult.ContentType);
            Assert.AreEqual(Encoding.UTF8, contentResult.ContentEncoding);
            Assert.IsNotNullOrEmpty(contentResult.Content);
        }

        [TestCase("commentType")]
        public void Can_ReadComment(string commentType)
        {
            // execute
            JsonResult jsonResult = _testingController.ReadComment(null, commentType) as JsonResult;
            DataSourceResult dataSourceResult = jsonResult.Data as DataSourceResult;

            // assert
            Assert.IsNotNull(jsonResult);
            Assert.IsNotNull(dataSourceResult);
            Assert.IsNotNull(dataSourceResult.Data);
            Assert.AreEqual(typeof(List<CommentViewModel>), dataSourceResult.Data.GetType());
            Assert.AreEqual(1, dataSourceResult.Total);
        }

        [TestCase("comments/1")]
        [TestCase("comments/2")]
        public void Can_DeleteComment(string commentUri)
        {
            // execute
            Action action = new Action(() => { _testingController.DeleteComment(commentUri); });

            // assert, just invoke our function, and it should working without exception
            Assert.DoesNotThrow(action.Invoke);
        }

        #endregion
    }
}
