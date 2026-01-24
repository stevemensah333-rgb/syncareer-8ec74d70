export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessment_results: {
        Row: {
          answers: Json
          application_id: string | null
          assessment_id: string
          candidate_id: string
          completed_at: string | null
          id: string
          passed: boolean | null
          score: number | null
          started_at: string
        }
        Insert: {
          answers?: Json
          application_id?: string | null
          assessment_id: string
          candidate_id: string
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
        }
        Update: {
          answers?: Json
          application_id?: string | null
          assessment_id?: string
          candidate_id?: string
          completed_at?: string | null
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "skills_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          banner_url: string | null
          category: string
          created_at: string
          created_by: string
          description: string | null
          icon_url: string | null
          id: string
          is_public: boolean
          name: string
          rules: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_public?: boolean
          name: string
          rules?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_public?: boolean
          name?: string
          rules?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          is_pinned: boolean
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          is_pinned?: boolean
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          is_pinned?: boolean
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          upvotes: number
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          upvotes?: number
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          comment_count: number
          community_id: string
          content: string
          cover_image_url: string | null
          created_at: string
          downvotes: number
          id: string
          is_pinned: boolean
          tags: string[] | null
          title: string
          updated_at: string
          upvotes: number
        }
        Insert: {
          author_id: string
          comment_count?: number
          community_id: string
          content: string
          cover_image_url?: string | null
          created_at?: string
          downvotes?: number
          id?: string
          is_pinned?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number
        }
        Update: {
          author_id?: string
          comment_count?: number
          community_id?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          downvotes?: number
          id?: string
          is_pinned?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      counsellor_availability: {
        Row: {
          counsellor_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
        }
        Insert: {
          counsellor_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
        }
        Update: {
          counsellor_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "counsellor_availability_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counsellor_availability_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      counsellor_bookings: {
        Row: {
          counsellor_id: string
          created_at: string
          day_of_week: number | null
          id: string
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          updated_at: string
          user_contact: string
          user_id: string
          user_name: string
        }
        Insert: {
          counsellor_id: string
          created_at?: string
          day_of_week?: number | null
          id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_contact: string
          user_id: string
          user_name: string
        }
        Update: {
          counsellor_id?: string
          created_at?: string
          day_of_week?: number | null
          id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
          user_contact?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "counsellor_bookings_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counsellor_bookings_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      counsellor_details: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country_code: string
          created_at: string
          full_name: string
          hiring_price: number | null
          id: string
          location: string | null
          phone_number: string
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country_code: string
          created_at?: string
          full_name: string
          hiring_price?: number | null
          id?: string
          location?: string | null
          phone_number: string
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country_code?: string
          created_at?: string
          full_name?: string
          hiring_price?: number | null
          id?: string
          location?: string | null
          phone_number?: string
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      counsellor_reviews: {
        Row: {
          counsellor_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          counsellor_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          counsellor_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "counsellor_reviews_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counsellor_reviews_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      counsellor_sessions: {
        Row: {
          amount_paid: number | null
          client_id: string
          counsellor_id: string
          created_at: string
          duration_minutes: number
          id: string
          meeting_link: string | null
          payment_status: string | null
          scheduled_at: string
          session_notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          client_id: string
          counsellor_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          payment_status?: string | null
          scheduled_at: string
          session_notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          client_id?: string
          counsellor_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          payment_status?: string | null
          scheduled_at?: string
          session_notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "counsellor_sessions_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counsellor_sessions_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_details: {
        Row: {
          company_description: string | null
          company_email: string | null
          company_location: string | null
          company_name: string
          company_phone: string | null
          company_size: string | null
          company_website: string | null
          created_at: string | null
          id: string
          industry: string | null
          job_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_description?: string | null
          company_email?: string | null
          company_location?: string | null
          company_name: string
          company_phone?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_description?: string | null
          company_email?: string | null
          company_location?: string | null
          company_name?: string
          company_phone?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          application_id: string
          candidate_feedback: string | null
          created_at: string
          duration_minutes: number
          id: string
          interview_type: string
          interviewer_notes: string | null
          location: string | null
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          application_id: string
          candidate_feedback?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          interview_type?: string
          interviewer_notes?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          candidate_feedback?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          interview_type?: string
          interviewer_notes?: string | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          notes: string | null
          resume_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          notes?: string | null
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          notes?: string | null
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          created_at: string
          department: string | null
          description: string
          employer_id: string
          employment_type: string
          id: string
          location: string
          requirements: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          skills: string[] | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          description: string
          employer_id: string
          employment_type: string
          id?: string
          location: string
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          description?: string
          employer_id?: string
          employment_type?: string
          id?: string
          location?: string
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills?: string[] | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_activities: {
        Row: {
          activity_date: string
          activity_type: string
          created_at: string
          duration_minutes: number | null
          id: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_goals: {
        Row: {
          created_at: string
          current_count: number
          goal_type: string
          id: string
          target_count: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          current_count?: number
          goal_type: string
          id?: string
          target_count?: number
          updated_at?: string
          user_id: string
          week_start?: string
        }
        Update: {
          created_at?: string
          current_count?: number
          goal_type?: string
          id?: string
          target_count?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          completed_modules: number
          created_at: string
          id: string
          path_title: string
          total_modules: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_modules?: number
          created_at?: string
          id?: string
          path_title: string
          total_modules?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_modules?: number
          created_at?: string
          id?: string
          path_title?: string
          total_modules?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          total_learning_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_learning_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_learning_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mock_interviews: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string
          difficulty: string
          duration_seconds: number | null
          feedback: Json | null
          id: string
          industry: string | null
          job_role: string
          overall_score: number | null
          questions: Json
          status: string
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          difficulty?: string
          duration_seconds?: number | null
          feedback?: Json | null
          id?: string
          industry?: string | null
          job_role: string
          overall_score?: number | null
          questions?: Json
          status?: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string
          difficulty?: string
          duration_seconds?: number | null
          feedback?: Json | null
          id?: string
          industry?: string | null
          job_role?: string
          overall_score?: number | null
          questions?: Json
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          created_at: string
          description: string
          github_url: string | null
          id: string
          is_verified: boolean | null
          project_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          github_url?: string | null
          id?: string
          is_verified?: boolean | null
          project_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          github_url?: string | null
          id?: string
          is_verified?: boolean | null
          project_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          project_id: string
          rating: number
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          project_id: string
          rating: number
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          project_id?: string
          rating?: number
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portfolio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          linkedin_url: string | null
          onboarding_completed: boolean | null
          updated_at: string | null
          user_type: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
      qualifications: {
        Row: {
          created_at: string | null
          degree_type: string
          id: string
          is_current: boolean | null
          major: string
          school: string
          updated_at: string | null
          user_id: string
          year_of_admission: number | null
          year_of_completion: number | null
        }
        Insert: {
          created_at?: string | null
          degree_type: string
          id?: string
          is_current?: boolean | null
          major: string
          school: string
          updated_at?: string | null
          user_id: string
          year_of_admission?: number | null
          year_of_completion?: number | null
        }
        Update: {
          created_at?: string | null
          degree_type?: string
          id?: string
          is_current?: boolean | null
          major?: string
          school?: string
          updated_at?: string | null
          user_id?: string
          year_of_admission?: number | null
          year_of_completion?: number | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          achievements: Json
          created_at: string
          education: Json
          experience: Json
          id: string
          is_primary: boolean | null
          personal_info: Json
          projects: Json
          references_section: string | null
          skills: Json
          template: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements?: Json
          created_at?: string
          education?: Json
          experience?: Json
          id?: string
          is_primary?: boolean | null
          personal_info?: Json
          projects?: Json
          references_section?: string | null
          skills?: Json
          template?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements?: Json
          created_at?: string
          education?: Json
          experience?: Json
          id?: string
          is_primary?: boolean | null
          personal_info?: Json
          projects?: Json
          references_section?: string | null
          skills?: Json
          template?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_endorsements: {
        Row: {
          created_at: string
          endorser_id: string
          id: string
          skill_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endorser_id: string
          id?: string
          skill_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          endorser_id?: string
          id?: string
          skill_name?: string
          user_id?: string
        }
        Relationships: []
      }
      skills_assessments: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          employer_id: string
          id: string
          is_active: boolean | null
          passing_score: number | null
          questions: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          employer_id: string
          id?: string
          is_active?: boolean | null
          passing_score?: number | null
          questions?: Json
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          employer_id?: string
          id?: string
          is_active?: boolean | null
          passing_score?: number | null
          questions?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_details: {
        Row: {
          created_at: string | null
          degree_type: string
          expected_completion: number | null
          id: string
          major: string
          school: string | null
          updated_at: string | null
          user_id: string
          year_of_admission: number | null
        }
        Insert: {
          created_at?: string | null
          degree_type: string
          expected_completion?: number | null
          id?: string
          major: string
          school?: string | null
          updated_at?: string | null
          user_id: string
          year_of_admission?: number | null
        }
        Update: {
          created_at?: string | null
          degree_type?: string
          expected_completion?: number | null
          id?: string
          major?: string
          school?: string | null
          updated_at?: string | null
          user_id?: string
          year_of_admission?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          endorsements_received: number
          id: string
          network_count: number
          skill_score: number
          skills_verified: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endorsements_received?: number
          id?: string
          network_count?: number
          skill_score?: number
          skills_verified?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endorsements_received?: number
          id?: string
          network_count?: number
          skill_score?: number
          skills_verified?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      counsellor_bookings_public: {
        Row: {
          counsellor_id: string | null
          created_at: string | null
          id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          counsellor_id?: string | null
          created_at?: string | null
          id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          counsellor_id?: string | null
          created_at?: string | null
          id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counsellor_bookings_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counsellor_bookings_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      counsellor_profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          hiring_price: number | null
          id: string | null
          location: string | null
          specialization: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          hiring_price?: number | null
          id?: string | null
          location?: string | null
          specialization?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          hiring_price?: number | null
          id?: string | null
          location?: string | null
          specialization?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employer" | "job_seeker"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "employer", "job_seeker"],
    },
  },
} as const
