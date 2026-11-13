# English Adventure 10.0 home video update

Overlay update for the inspected english-adventure-pwa main branch.

Files: replace index.html, app.js, and sw.js in the repository root; add home-intro.mp4 and home-intro-poster.jpg to the root.

The Meta AI video becomes the default home banner when no custom banner photos are configured. It plays muted, inline, and in a loop; native controls allow pausing or enabling sound. Existing learning, game, progress, profile, and navigation features remain in place. The poster is precached for offline display; the larger video is not part of install caching, and Range requests bypass the service worker. Custom banner photos continue to override the video.

After applying these five files, commit to main for GitHub Pages to publish.
