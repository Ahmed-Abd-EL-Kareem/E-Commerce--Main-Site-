import React from "react";

const blogs = [
  {
    img: "https://dummyimage.com/300x200/eee/333&text=Blog+1",
    date: "2024-06-01",
    title:
      "How to Choose the Right Headphones for Your Needs: A Comprehensive Guide",
  },
  {
    img: "https://dummyimage.com/300x200/ddd/333&text=Blog+2",
    date: "2024-05-28",
    title: "Revolutionary Tech: The Rise of Smart Devices in 2024",
  },
  {
    img: "https://dummyimage.com/300x200/ccc/333&text=Blog+3",
    date: "2024-05-20",
    title: "How to Choose the Right Laptop for Your Needs",
  },
];

const BlogSection = () => (
  <section className="py-8 px-2 md:px-8">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">
      Latest News & Blog
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {blogs.map((blog, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="bg-gray-50 flex justify-center items-center h-48">
            <img
              src={blog.img}
              alt={blog.title}
              className="object-contain h-40 w-full"
            />
          </div>
          <div className="flex-1 flex flex-col p-4">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold rounded px-3 py-1 mb-2 w-fit">
              NEW ARRIVALS
            </span>
            <span className="text-xs text-gray-400 mb-1">{blog.date}</span>
            <h4 className="font-semibold text-lg text-gray-800 mb-4 line-clamp-2 min-h-[48px]">
              {blog.title}
            </h4>
            <button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2 w-full flex items-center justify-center gap-2 transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Read More
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BlogSection;
