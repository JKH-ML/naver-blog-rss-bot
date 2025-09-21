const { createClient } = require('@supabase/supabase-js');
const Parser = require('rss-parser');

const BLOG_NAME = process.env.BLOG_NAME;
const RSS_URL = `https://rss.blog.naver.com/${BLOG_NAME}.xml`;
const SUPABASE_URL = 'https://gcjwitsvfolvgvsyolde.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const parser = new Parser();

async function fetchRSSFeed() {
  try {
    console.log('Fetching RSS feed...');
    const feed = await parser.parseURL(RSS_URL);
    return feed.items;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw error;
  }
}

async function getStoredPosts() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_date', { ascending: false });

    if (error) {
      console.error('Error fetching stored posts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getStoredPosts:', error);
    throw error;
  }
}

async function storePost(post) {
  try {
    const postData = {
      title: post.title,
      link: post.link,
      published_date: new Date(post.pubDate).toISOString(),
      description: post.contentSnippet || post.content || '',
      guid: post.guid || post.link
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postData])
      .select();

    if (error) {
      console.error('Error storing post:', error);
      throw error;
    }

    console.log('Post stored successfully:', postData.title);
    return data[0];
  } catch (error) {
    console.error('Error in storePost:', error);
    throw error;
  }
}

async function sendDiscordNotification(post) {
  try {
    const embed = {
      title: post.title,
      url: post.link,
      description: post.description.substring(0, 300) + (post.description.length > 300 ? '...' : ''),
      color: 5814783,
      timestamp: post.published_date,
      footer: {
        text: 'Naver Blog RSS Bot'
      }
    };

    const payload = {
      embeds: [embed]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }

    console.log('Discord notification sent for:', post.title);
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    throw error;
  }
}

async function sendSetupNotification() {
  try {
    const embed = {
      title: '🚀 RSS Bot Setup Complete!',
      description: `RSS bot has been successfully configured and is now monitoring the blog feed.\n\nThe bot will check for new posts every 10 minutes and send notifications here.`,
      color: 3066993, // Green color
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Naver Blog RSS Bot - Setup Complete'
      }
    };

    const payload = {
      embeds: [embed]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }

    console.log('Setup notification sent to Discord');
  } catch (error) {
    console.error('Error sending setup notification:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting RSS bot...');

    const rssItems = await fetchRSSFeed();
    const storedPosts = await getStoredPosts();

    // Check if this is the first run (no posts in database)
    const isFirstRun = storedPosts.length === 0;

    if (isFirstRun) {
      console.log('First run detected - sending setup notification...');
      await sendSetupNotification();
    }

    const storedGuids = new Set(storedPosts.map(post => post.guid));

    let newPostsCount = 0;

    for (const item of rssItems) {
      const guid = item.guid || item.link;

      if (!storedGuids.has(guid)) {
        console.log('New post found:', item.title);

        const storedPost = await storePost(item);

        // Only send notification for new posts if not first run
        // On first run, just store all posts without notification
        if (!isFirstRun) {
          await sendDiscordNotification(storedPost);
        }

        newPostsCount++;
      }
    }

    if (isFirstRun) {
      console.log(`First run completed - stored ${newPostsCount} existing posts.`);
    } else if (newPostsCount === 0) {
      console.log('No new posts found.');
    } else {
      console.log(`Processed ${newPostsCount} new posts.`);
    }

  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}