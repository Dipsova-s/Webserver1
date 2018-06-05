using System;
using System.Collections.Generic;
using System.Net;
using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.Comment;
using EveryAngle.Utilities;
using EveryAngle.WebClient.Service.HttpHandlers;
using Newtonsoft.Json;
using RestSharp;

namespace EveryAngle.WebClient.Service.ApiServices
{
    public class CommentService : ICommentService
    {
        public ListViewModel<CommentViewModel> GetCommentsByType(string uri)
        {
            var requestManager = RequestManager.Initialize( uri);
            var jsonResult = requestManager.Run();
            var comment = new ListViewModel<CommentViewModel>();
            comment.Data =
                JsonConvert.DeserializeObject<List<CommentViewModel>>(jsonResult.SelectToken("comments").ToString(),
                    new UnixDateTimeConverter());
            comment.Header = JsonConvert.DeserializeObject<HeaderViewModel>(jsonResult.SelectToken("header").ToString());
            return comment;
        }

        public CommentViewModel AddComment(string commentsUri, string comment)
        {
            var requestManager = RequestManager.Initialize(commentsUri);
            var jsonResult = requestManager.Run(Method.POST,comment);
            var result = JsonConvert.DeserializeObject<CommentViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return result;
        }

        public CommentViewModel UpdateComment(string commentsUri, string comment)
        {
            var requestManager = RequestManager.Initialize(commentsUri);
            var jsonResult = requestManager.Run(Method.PUT, comment);
            var result = JsonConvert.DeserializeObject<CommentViewModel>(jsonResult.ToString(),
                new UnixDateTimeConverter());
            return result;
        }

        public void DeleteComment(string uri)
        {
            var requestManager = RequestManager.Initialize(uri);
            var jsonResult = requestManager.Run(Method.DELETE);

            if (requestManager.ResponseStatus != HttpStatusCode.NoContent)
            {
                throw new Exception(jsonResult.ToString());
            }
        }
    }
}
