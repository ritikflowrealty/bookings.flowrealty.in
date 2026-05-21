'use client';

import { useState } from 'react';

type Member = {
  id: number;
  name: string;
  designation: string;
  category: string;
  photo_url: string;
  bio: string;
  linkedin_url: string;
};

export function TeamMemberCard({ member, compact }: { member: Member; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasBio = !compact && member.bio && member.bio.length > 0;
  const isLongBio = hasBio && member.bio.length > 120;

  return (
    <article className={`glass rounded-2xl ${compact ? 'p-4' : 'p-6'} hover:bg-white/[0.06] transition-colors`}>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white/[0.03]">
        {member.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neon-purple/20 to-neon-orange/20 flex items-center justify-center">
            <span className="font-display text-3xl text-ink-dim">
              {member.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className={`font-display ${compact ? 'text-base' : 'text-lg'} leading-tight`}>{member.name}</h3>
        <p className="mt-0.5 text-xs text-ink-muted">{member.designation}</p>
        
        {/* Bio with show more/less */}
        {hasBio && (
          <div className="mt-2">
            <p className={`text-xs text-ink-muted leading-relaxed ${!expanded && isLongBio ? 'line-clamp-3' : ''}`}>
              {member.bio}
            </p>
            {isLongBio && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-[11px] text-neon-purple hover:text-neon-magenta transition-colors"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {member.linkedin_url && (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-ink-dim hover:text-ink transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
        )}
      </div>
    </article>
  );
}
