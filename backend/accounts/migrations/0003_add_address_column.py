from django.db import migrations, models


def fix_blank_emails(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    seen = set()
    for user in User.objects.all().order_by('id'):
        email = user.email.strip()
        if not email or email in seen:
            user.email = f'{user.username}@placeholder.aurumkeys.local'
            user.save(update_fields=['email'])
        else:
            seen.add(email)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_update_user_model'),
    ]

    operations = [
        # Add address column (the one that's missing from the live database)
        migrations.AddField(
            model_name='user',
            name='address',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        # Fix blank/duplicate emails before applying unique constraint
        migrations.RunPython(fix_blank_emails, migrations.RunPython.noop),
        # Make email unique (needed for USERNAME_FIELD = "email" to work)
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=254, unique=True),
        ),
    ]
