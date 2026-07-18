-- CreateIndex
CREATE INDEX "blogs_isPublished_idx" ON "blogs"("isPublished");

-- CreateIndex
CREATE INDEX "blogs_publishedAt_idx" ON "blogs"("publishedAt");

-- CreateIndex
CREATE INDEX "blogs_isFeatured_idx" ON "blogs"("isFeatured");

-- CreateIndex
CREATE INDEX "case_studies_isPublished_idx" ON "case_studies"("isPublished");

-- CreateIndex
CREATE INDEX "case_studies_isFeatured_idx" ON "case_studies"("isFeatured");

-- CreateIndex
CREATE INDEX "clients_isPublished_idx" ON "clients"("isPublished");

-- CreateIndex
CREATE INDEX "contact_messages_email_idx" ON "contact_messages"("email");

-- CreateIndex
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "projects_isPublished_idx" ON "projects"("isPublished");

-- CreateIndex
CREATE INDEX "projects_isFeatured_idx" ON "projects"("isFeatured");

-- CreateIndex
CREATE INDEX "site_settings_group_idx" ON "site_settings"("group");

-- CreateIndex
CREATE INDEX "testimonials_isPublished_idx" ON "testimonials"("isPublished");
