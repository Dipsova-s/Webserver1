using System;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Comment;
using EveryAngle.WebClient.Service.Security;
using EveryAngle.Shared.Helpers;

using Kendo.Mvc.UI;
using EveryAngle.ManagementConsole.Helpers;
using EveryAngle.Core.ViewModels.Directory;
using Newtonsoft.Json;

namespace EveryAngle.ManagementConsole.Controllers
{
    public class CommentController : BaseController
    {
        #region private variables

        private readonly ICommentService _commentService;

        #endregion

        #region constructors

        public CommentController(
            ICommentService commentService,
            AuthorizationHelper authorizationHelper)
        {
            _commentService = commentService;
            AuthorizationHelper = authorizationHelper;
        }

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        #endregion

        #region routes

        public ActionResult GetCommentsByType(string commentType)
        {
            ViewData["DefaultPageSize"] = DefaultPageSize;
            ViewBag.CommentType = commentType;
            ViewBag.CurrentUserUri = AuthorizationHelper.CurrentUser.Uri;
            return PartialView("~/Views/Shared/Comment.cshtml");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult AddComment(FormCollection formCollection, string commentType)
        {
            CommentViewModel comment = new CommentViewModel();
            string commentUri = formCollection["commentUri"];
            
            if (!string.IsNullOrEmpty(commentUri) && !string.IsNullOrWhiteSpace(commentUri))
            {
                comment.comment = formCollection["message"];
                _commentService.UpdateComment(commentUri, new JavaScriptSerializer().Serialize(comment));
            }
            else
            {
                VersionViewModel version = AuthorizationHelper.Version;
                string uri = version.GetEntryByName("comments").Uri.ToString();
                comment.comment_type = formCollection["commentType"];
                comment.comment = formCollection["message"];
                _commentService.AddComment(uri, JsonConvert.SerializeObject(comment));
            }
            return JsonHelper.GetJsonStringResult(
                                true, null, null, MessageType.DEFAULT,
                                new { commentType = formCollection["commentType"] });
        }


        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReadComment([DataSourceRequest] DataSourceRequest request, string commentType)
        {
            var date = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var comments = GetComments(commentType, 1, MaxPageSize);
            var result = new DataSourceResult
            {
                Data =
                    comments.Data.OrderByDescending(
                        comment => date.AddMilliseconds(comment.CreatedBy.Created).ToLocalTime()).ToList(),
                Total = comments.Header.Total
            };
            return Json(result);
        }

        [AcceptVerbs(HttpVerbs.Delete)]
        public void DeleteComment(string commentUri)
        {
            _commentService.DeleteComment(commentUri);
        }

        #endregion

        #region private methods

        private ListViewModel<CommentViewModel> GetComments(string commentType, int page, int pageSize)
        {
            var uri = GenerateUri(commentType, page, pageSize);
            var comments = _commentService.GetCommentsByType(uri);
            return comments;
        }

        private string GenerateUri(string commentType, int page, int pageSize)
        {
            var version = AuthorizationHelper.Version;
            var uri = version.GetEntryByName("comments").Uri + "?comment_type=" + commentType + "&" +
                      UtilitiesHelper.GetOffsetLimitQueryString(page, pageSize);
            return uri;
        }

        #endregion
    }
}
