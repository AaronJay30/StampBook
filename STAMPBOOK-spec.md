{
  "project": {
    "name": "StampBook Social",
    "vision": "A cute, scrapbook-style social platform where users collect, create, and share stamps as memories.",
    "core_experience": "Users create a personal stamp book by cutting images into stamp shapes and placing them into a grid. Each stamp tells a story.",
    "theme": "sakura_kawaii",
    "style": ["cute", "pastel", "soft", "playful", "emotional"]
  },

  "phases": {
    "phase_1": [
      "authentication",
      "stamp_creation",
      "grid_book",
      "basic_sharing"
    ],
    "phase_2": [
      "description_modal",
      "animations",
      "sound_effects"
    ],
    "phase_3": [
      "social_feed",
      "likes",
      "comments",
      "profiles"
    ]
  },

  "authentication": {
    "provider": "supabase",
    "methods": ["email_password"],
    "tables": ["auth.users", "profiles"]
  },

  "ui_ux": {
    "theme": {
      "name": "sakura",
      "colors": {
        "primary": "#FFC0CB",
        "secondary": "#FFDEE9",
        "accent": "#F8AFA6",
        "background": "#FFF5F7"
      },
      "effects": [
        "falling_sakura_petals",
        "soft_shadow",
        "paper_texture"
      ]
    },

    "components": {
      "buttons": {
        "style": "rounded_soft",
        "primary_label": "Stamp 🌸"
      },
      "grid": {
        "rows": 4,
        "columns": 3,
        "show_index_number": true,
        "index_position": "bottom_right"
      }
    }
  },

  "book_system": {
    "structure": {
      "book": "1 per user",
      "pages": "multiple",
      "grid_per_page": "4x3"
    },
    "animations": {
      "page_flip": {
        "library": "react-pageflip",
        "realistic": true
      }
    }
  },

  "stamp_system": {
    "creation_flow": [
      "click_stamp_button",
      "upload_image",
      "open_editor",
      "apply_shape_mask",
      "adjust_position",
      "confirm",
      "place_in_grid",
      "open_description_modal"
    ],

    "shapes": [
      "square",
      "circle",
      "heart",
      "star",
      "stamp_edge"
    ],

    "packs": [
      {
        "name": "Cute Basics",
        "items": ["heart", "star", "circle"]
      },
      {
        "name": "Kawaii Animals",
        "items": ["cat", "bear", "bunny"]
      },
      {
        "name": "Sakura Pack",
        "items": ["sakura_flower", "petal"]
      }
    ],

    "editor": {
      "library": "react-konva",
      "features": [
        "drag",
        "zoom",
        "rotate",
        "crop",
        "mask_shape_preview"
      ],
      "output": {
        "format": "png",
        "transparent": true
      }
    }
  },

  "modals": {
    "after_stamp": {
      "type": "description_modal",
      "fields": ["description"],
      "animation": {
        "library": "framer-motion",
        "in": "scale_fade_in",
        "out": "scale_fade_out"
      }
    },

    "view_stamp": {
      "type": "stamp_view_modal",
      "trigger": "click_stamp",
      "content": [
        "image",
        "description",
        "user"
      ],
      "animation": {
        "library": "framer-motion",
        "in": "zoom_bounce",
        "out": "fade"
      }
    }
  },

  "sound_system": {
    "library": "use-sound",
    "sounds": {
      "stamp": "pop.mp3",
      "page_flip": "flip.mp3",
      "modal": "bubble.mp3"
    }
  },

  "social_features": {
    "profiles": {
      "fields": ["username", "avatar", "bio"]
    },
    "sharing": {
      "book_url": "/user/{username}",
      "public": true
    },
    "interactions": [
      "like",
      "comment"
    ],
    "feed": {
      "type": "global",
      "content": [
        "recent_stamps",
        "popular_users"
      ]
    }
  },

  "supabase": {
    "database": {
      "tables": {
        "profiles": {
          "columns": [
            "id (uuid, PK)",
            "username (text)",
            "avatar_url (text)",
            "bio (text)",
            "created_at (timestamp)"
          ]
        },
        "books": {
          "columns": [
            "id (uuid, PK)",
            "user_id (uuid)",
            "title (text)",
            "is_public (boolean)",
            "created_at (timestamp)"
          ]
        },
        "pages": {
          "columns": [
            "id (uuid, PK)",
            "book_id (uuid)",
            "page_number (int)"
          ]
        },
        "stamps": {
          "columns": [
            "id (uuid, PK)",
            "user_id (uuid)",
            "image_url (text)",
            "shape (text)",
            "description (text)",
            "created_at (timestamp)"
          ]
        },
        "grid_slots": {
          "columns": [
            "id (uuid, PK)",
            "page_id (uuid)",
            "row (int)",
            "column (int)",
            "stamp_id (uuid)"
          ]
        },
        "likes": {
          "columns": [
            "id",
            "user_id",
            "stamp_id"
          ]
        },
        "comments": {
          "columns": [
            "id",
            "user_id",
            "stamp_id",
            "content"
          ]
        }
      }
    },

    "storage": {
      "buckets": {
        "stamps": {
          "public": true,
          "path": "/{user_id}/{stamp_id}.png"
        },
        "avatars": {
          "public": true,
          "path": "/{user_id}/avatar.png"
        }
      }
    }
  },

  "frontend_architecture": {
    "framework": "Next.js",
    "structure": {
      "pages": [
        "/login",
        "/register",
        "/dashboard",
        "/book/[username]"
      ],
      "components": [
        "StampGrid",
        "StampEditor",
        "StampModal",
        "BookViewer",
        "PageFlip",
        "Navbar"
      ],
      "state_management": "React Context or Zustand"
    }
  },

  "animations": {
    "library": "framer-motion",
    "effects": [
      "button_bounce",
      "stamp_drop",
      "modal_scale",
      "hover_zoom",
      "page_flip"
    ]
  },

  "core_flows": {
    "create_stamp": [
      "click Stamp 🌸",
      "upload image",
      "edit image",
      "apply shape",
      "save",
      "auto place in grid",
      "open description modal",
      "save description"
    ],

    "view_stamp": [
      "click grid item",
      "open animated modal",
      "view image + description"
    ],

    "share_book": [
      "copy profile link",
      "open public view",
      "others can view stamps"
    ]
  },

  "future_features": [
    "follow system",
    "notifications",
    "private books",
    "collaborative books",
    "AI auto crop",
    "mobile app"
  ]
}